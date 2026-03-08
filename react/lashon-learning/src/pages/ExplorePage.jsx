import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { getImportantLexiconInformation, getVerses } from "../services/sefariaApi";
import { sanitizeHtml, toSefariaUrl } from "../utils/sefaria";

export default function ExplorePage() {
  const { word } = useParams();
  const decodedWord = decodeURIComponent(word);
  const [lexicon, setLexicon] = useState(null);
  const [verses, setVerses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllVerses, setShowAllVerses] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setLexicon(null);
    setVerses(null);
    setShowAllVerses(false);

    Promise.all([
      getImportantLexiconInformation(decodedWord),
      getVerses(decodedWord).catch(() => ({})),
    ]).then(([lex, v]) => {
      if (cancelled) return;
      if (!lex) {
        setError("Could not find lexicon data for this word.");
      } else {
        setLexicon(lex);
      }
      setVerses(v && typeof v === "object" ? v : {});
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setError("Failed to load word data.");
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [decodedWord]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center justify-center px-4 py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-3 text-zinc-600 font-medium">Loading word data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center justify-center px-4 py-8">
        <p className="text-zinc-500">{error}</p>
        <Link
          to="/wordlist"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
        >
          <ChevronLeft size={16} />
          Back to Word List
        </Link>
      </div>
    );
  }

  const verseEntries = verses ? Object.entries(verses) : [];
  const displayedVerses = showAllVerses ? verseEntries : verseEntries.slice(0, 3);
  const remainingVerses = verseEntries.length - 3;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      {/* Back button */}
      <Link
        to="/wordlist"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-800"
      >
        <ChevronLeft size={16} />
        Word List
      </Link>

      {/* Word Header */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              className="text-4xl font-bold text-zinc-900 sm:text-6xl font-hebrew-serif"
              dir="rtl"
            >
              {lexicon.headword}
            </h1>
            {(lexicon.transliteration || lexicon.pronunciation) && (
              <p className="mt-2 text-lg text-zinc-500">
                {lexicon.transliteration && (
                  <span className="italic">{lexicon.transliteration}</span>
                )}
                {lexicon.pronunciation && (
                  <span className="ml-2 text-zinc-400">({lexicon.pronunciation})</span>
                )}
              </p>
            )}
          </div>

          {/* Navigate between headwords */}
          <div className="flex items-center gap-2">
            {lexicon.prevHeadword && (
              <Link
                to={`/wordlist/${encodeURIComponent(lexicon.prevHeadword)}`}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
                title={lexicon.prevHeadword}
              >
                <ChevronLeft size={14} />
                <span dir="rtl">{lexicon.prevHeadword}</span>
              </Link>
            )}
            {lexicon.nextHeadword && (
              <Link
                to={`/wordlist/${encodeURIComponent(lexicon.nextHeadword)}`}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
                title={lexicon.nextHeadword}
              >
                <span dir="rtl">{lexicon.nextHeadword}</span>
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {lexicon.morphology && (
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary">
              {lexicon.morphology}
            </span>
          )}
          {lexicon.strongNumber && (
            <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-500">
              Strong's #{lexicon.strongNumber}
            </span>
          )}
          {lexicon.languagePeriods.map((lp) => (
            <span
              key={lp}
              className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
            >
              {lp}
            </span>
          ))}
          {lexicon.pluralForm.length > 0 && (
            <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-500" dir="rtl">
              pl. {lexicon.pluralForm.join(", ")}
            </span>
          )}
        </div>
      </div>

      {/* Root & Etymology */}
      {(lexicon.shoresh || lexicon.etymology) && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Root & Etymology
          </h2>
          {lexicon.shoresh && (
            <p className="mb-3 text-3xl font-bold text-primary font-hebrew-serif tracking-[0.3em]" dir="rtl">
              {lexicon.shoresh.split("").join(" · ")}
            </p>
          )}
          {lexicon.etymology && (
            <p className="text-sm leading-relaxed text-zinc-600">
              {lexicon.etymology}
            </p>
          )}
        </div>
      )}

      {/* Derivatives & Related Words */}
      {(lexicon.derivatives.length > 0 || lexicon.relatedEntries.length > 0) && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {lexicon.derivatives.length > 0 && (
            <div className="mb-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Derivatives
              </h2>
              <div className="flex flex-wrap gap-2">
                {lexicon.derivatives.map((d) => (
                  <Link
                    key={d}
                    to={`/wordlist/${encodeURIComponent(d)}`}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    dir="rtl"
                  >
                    {d}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {lexicon.relatedEntries.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Related Words
              </h2>
              <div className="flex flex-wrap gap-2">
                {lexicon.relatedEntries.map((r) => (
                  <Link
                    key={r}
                    to={`/wordlist/${encodeURIComponent(r)}`}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    dir="rtl"
                  >
                    {r}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Definitions by Source */}
      {lexicon.definitionsBySource.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Definitions
          </h2>
          {lexicon.definitionsBySource.map((source, si) => (
            <SourceCard key={si} source={source} />
          ))}
        </div>
      )}

      {/* Verses */}
      {verseEntries.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Verses ({verseEntries.length})
          </h2>
          <div className="flex flex-col gap-3">
            {displayedVerses.map(([ref, text], i) => (
              <a
                key={i}
                href={toSefariaUrl(ref)}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-zinc-200 bg-zinc-50 p-3 shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="text-[10px] font-bold uppercase text-primary mb-1" dir="ltr">
                  {String(ref)}
                </div>
                <div
                  className="text-base leading-relaxed text-zinc-800 font-serif"
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(text)) }}
                />
              </a>
            ))}
            {remainingVerses > 0 && (
              <button
                onClick={() => setShowAllVerses((prev) => !prev)}
                className="self-center text-xs font-medium text-primary hover:underline"
              >
                {showAllVerses
                  ? "Show less"
                  : `View ${remainingVerses} more verse${remainingVerses === 1 ? "" : "s"}`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceCard({ source }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-zinc-50"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-zinc-400" />
          <span className="font-semibold text-zinc-800">{source.source}</span>
          {source.morphology && (
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
              {source.morphology}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-sky-600">{source.language}</span>
          <ChevronRight
            size={14}
            className={`text-zinc-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </div>
      </button>
      {expanded && (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3">
          <SenseList senses={source.senses} />
        </div>
      )}
    </div>
  );
}

function SenseList({ senses }) {
  if (!senses || senses.length === 0) {
    return <p className="text-sm text-zinc-400">No definitions available.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {senses.map((sense, i) => {
        if (sense.stem) {
          return (
            <div key={i} className="mt-1">
              <span className="inline-flex rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {sense.stem}
              </span>
              {sense.subSenses?.length > 0 && (
                <div className="ml-4 mt-1">
                  <SenseList senses={sense.subSenses} />
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            key={i}
            className="text-sm text-zinc-700 leading-relaxed"
            style={{ paddingLeft: `${sense.depth * 12}px` }}
          >
            {sense.number && (
              <span className="mr-1.5 font-semibold text-zinc-500">{sense.number}</span>
            )}
            {sense.languageCode && (
              <span className="mr-1.5 text-[10px] font-medium uppercase text-sky-500">
                [{sense.languageCode}]
              </span>
            )}
            <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(sense.definition) }} />
          </div>
        );
      })}
    </div>
  );
}
