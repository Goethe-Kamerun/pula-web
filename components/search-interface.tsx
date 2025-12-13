"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LanguageSelect from "@/components/language-select";
import SearchInput from "@/components/search-input";
import { useToast } from "@/components/ui/use-toast";
import { useApiWithStore } from "@/hooks/useApiWithStore";

export default function SearchInterface() {
  // const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter();
  const { toast } = useToast();
  const {
    getLanguages,
    languageLoading,
    languageError,
    languages,
    selectedSourceLanguage,
    selectedTargetLanguage1,
    selectedTargetLanguage2,
    setSelectedSourceLanguage,
    setSelectedTargetLanguage1,
    setSelectedTargetLanguage2,
    clickedLexeme,
  } = useApiWithStore();

  const areLanguagesSelected =
    selectedSourceLanguage &&
    selectedTargetLanguage1 &&
    selectedTargetLanguage2;
  // const areLanguagesSelected = true;

  // Load languages when component mounts
  useEffect(() => {
    getLanguages();
  }, []);

  useEffect(() => {
    if (clickedLexeme) {
      router.push(`/results/${encodeURIComponent(clickedLexeme.id)}`);
    }
  }, [clickedLexeme]);

  const handleSearch = (query: string) => {
    if (!areLanguagesSelected) {
      toast({
        title: "Languages required",
        description:
          "You must select a source language and at least one target language first.",
        variant: "destructive",
      });
      return;
    }
  };

  // Determine if fields should be disabled
  const isDestination1Disabled = !selectedSourceLanguage;
  const isDestination2Disabled = !selectedTargetLanguage1;

  // Clear dependent fields when parent field is cleared
  useEffect(() => {
    if (!selectedSourceLanguage) {
      setSelectedTargetLanguage1(null);
      setSelectedTargetLanguage2(null);
    }
  }, [selectedSourceLanguage, setSelectedTargetLanguage1, setSelectedTargetLanguage2]);

  useEffect(() => {
    if (!selectedTargetLanguage1) {
      setSelectedTargetLanguage2(null);
    }
  }, [selectedTargetLanguage1, setSelectedTargetLanguage2]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-normal mb-4" style={{ color: "#222222" }}>
          Explore words and phrases in other languages
        </h1>
        <p className="max-w-2xl mx-auto" style={{ color: "#72777d" }}>
          {/* Select your languages and search for a word! */}
          Select languages to proceed.
        </p>
      </div>

      {/* Language Selection */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LanguageSelect
            value={selectedSourceLanguage?.lang_code || ""}
            onChange={(langCode) => {
              const language = languages.find(
                (lang) => lang.lang_code === langCode
              );
              setSelectedSourceLanguage(language || null);
            }}
            placeholder="Select source language"
            label="Source Language"
          />
          <LanguageSelect
            value={selectedTargetLanguage1?.lang_code || ""}
            onChange={(langCode) => {
              const language = languages.find(
                (lang) => lang.lang_code === langCode
              );
              setSelectedTargetLanguage1(language || null);
            }}
            placeholder="Select target language 1"
            label="Target Language 1"
            span="*"
            disabled={isDestination1Disabled}
          />
          <LanguageSelect
            value={selectedTargetLanguage2?.lang_code || ""}
            onChange={(langCode) => {
              const language = languages.find(
                (lang) => lang.lang_code === langCode
              );
              setSelectedTargetLanguage2(language || null);
            }}
            placeholder="Select target language 2"
            label="Target Language 2"
            span="*"
            disabled={isDestination2Disabled}
          />
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <SearchInput
          disabled={!areLanguagesSelected}
          onSearch={handleSearch}
          value={""}
          onChange={(v) => null}
        />
      </div>

      {/* Instructions */}
      {!areLanguagesSelected && (
        <div
          className="border rounded p-4 text-center"
          style={{
            backgroundColor: "#f8f9fa",
            borderColor: "#a2a9b1",
          }}
        >
          <p style={{ color: "#72777d" }}>
            Please select a source language and at least one target language to
            enable search
          </p>
        </div>
      )}

      {/* Language Loading Error */}
      {languageError && (
        <div
          className="border rounded p-4 text-center"
          style={{
            backgroundColor: "#fef2f2",
            borderColor: "#fecaca",
          }}
        >
          <p style={{ color: "#dc2626" }}>
            Error loading languages: {languageError}
          </p>
        </div>
      )}
    </div>
  );
}
