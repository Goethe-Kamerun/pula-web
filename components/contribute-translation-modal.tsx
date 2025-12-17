"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip-info";
import {
  AddTranslationRequest,
  Language,
  LexemeSearchRequest,
  LexemeSearchResult,
  LexemeTranslation,
} from "@/lib/types/api";
import { useEffect, useState } from "react";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { api } from "@/lib/api";
import Spinner from "./spinner";

interface ContributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language | null;
  onSuccess?: () => void;
  lexemeTranslations: LexemeTranslation[] | null;
}

export default function ContributeTranslationModal({
  open,
  onOpenChange,
  language,
  onSuccess,
  lexemeTranslations,
}: ContributeModalProps) {
  const [query, setQuery] = useState("");
  const [lexemes, setLexemes] = useState<LexemeSearchResult[]>([]);
  const [hasSelectedLexeme, setHasSelectedLexeme] = useState(false);
  const [selectedSenseId, setSelectedSenseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedLexeme, addTranslation } = useApiWithStore();

  const handleSubmit = async () => {
    // console.log("selectedLexeme", selectedLexeme);
    // console.log("lexemeTranslations", lexemeTranslations);
    // console.log("language", language);
    const baseLexeme =
      lexemeTranslations?.find((t) => t.trans_language === language?.lang_code)
        ?.base_lexeme || "";
    if (!selectedSenseId || !baseLexeme) {
      alert("Please select a sense and a base lexeme");
      return;
    }

    try {
      const request: AddTranslationRequest[] = [
        {
          base_lexeme: baseLexeme,
          translation_sense_id: selectedSenseId,
          translation_language: language?.lang_code || "",
          value: query,
          is_new: !hasSelectedLexeme,
          categoryId: selectedLexeme?.lexeme?.lexicalCategoryId || "",
        },
      ];
      console.log("request", request);
      // return;
      setIsSubmitting(true);
      await addTranslation(request);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting label:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLexemes = async () => {
    if (!language || !language.lang_code) {
      return;
    }

    const request: LexemeSearchRequest = {
      ismatch: 1,
      search: query,
      src_lang: language?.lang_code || "",
      with_sense: true,
    };
    const results = await api.searchLexemes(request);
    setLexemes(results);
    setHasSelectedLexeme(false);
  };

  useEffect(() => {
    getLexemes();
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Translation Contribution
            <Tooltip description="Add a translation to help improve our translations for this language." />
          </DialogTitle>
          <DialogDescription>
            Add a translation to help improve our translations for{" "}
            {language ? language.lang_label : "the language"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center items-center space-x-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for existing lexemes"
              className="w-full pl-10 pr-10 py-3 rounded-lg text-lg focus:outline-none transition-colors"
              style={{
                border: `1px solid #a2a9b1`,
                backgroundColor: "#ffffff",
                color: "#222222",
                cursor: "text",
              }}
              onFocusCapture={(e) =>
                (e.currentTarget.style.borderColor = "#0645ad")
              }
              onBlur={(e) => (e.currentTarget.style.borderColor = "#a2a9b1")}
            />
          </div>

          {lexemes.length > 0 && !hasSelectedLexeme && (
            <div
              className="w-full bg-white rounded-lg shadow-lg overflow-auto"
              style={{
                border: `1px solid #a2a9b1`,
                maxHeight: "160px",
              }}
            >
              {lexemes.map((lexeme) => (
                <button
                  key={lexeme.id}
                  type="button"
                  onClick={() => {
                    setQuery(lexeme.label);
                    setHasSelectedLexeme(true);
                    setSelectedSenseId(lexeme.sense_id || null);
                  }}
                  className="w-full text-left px-4 py-3 text-sm focus:outline-none flex items-center space-x-3 transition-colors"
                  style={{
                    color: "#222222",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <div className="flex-1">
                    <div className="font-medium">{lexeme.label}</div>
                    <div className="text-xs" style={{ color: "#72777d" }}>
                      {lexeme.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {lexemes.length === 0 && query && (
            <div className="text-red-500 text-sm">Lexeme does not exist</div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : hasSelectedLexeme
                ? "Save existing translation"
                : "Save new translation"}
              <Spinner loading={isSubmitting} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
