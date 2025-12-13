
"use client";

import { useState, useEffect, useCallback, use, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import LexemeDetailResultComponent from "@/components/lexeme-detail-result";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { useToast } from "@/components/ui/use-toast";
import SearchInput from "@/components/search-input";
import LanguageSelect from "@/components/language-select";
import {
  GlossWithSense,
  Language,
  LexemeDetailResult,
  LexemeTranslation,
} from "@/lib/types/api";
// import ContributeModal from "@/components/contribute-audio-modal";
import ContributeAudioModal from "@/components/contribute-audio-modal";
import { useAuthStore } from "@/lib/stores";
import GuessContribute from "@/components/guess-contribute";
import Spinner from "@/components/spinner";
import ContributeTranslationModal from "@/components/contribute-translation-modal";
import ContributeDescriptionModal from "@/components/contribute-description-modal";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const resolvedParams = use(params);
  const lexemeId = decodeURIComponent(resolvedParams.query);
  const router = useRouter();
  const { toast } = useToast();
  const {
    searchLexemes,
    getLexemeDetails,
    getLexemeTranslations,
    lexemes,
    selectedLexeme,
    lexemeLoading,
    lexemeError,
    selectedSourceLanguage,
    selectedTargetLanguage1,
    selectedTargetLanguage2,
    clickedLexeme,
    languages,
    setSelectedSourceLanguage,
    getLanguages,
    setSelectedTargetLanguage1,
    setSelectedTargetLanguage2,
    query,
    lexemeTranslations,
  } = useApiWithStore();


  const [sourceLexemeDetails, setSourceLexemeDetails] = useState<
    GlossWithSense[]
  >([]);
  const [target1LexemeDetails, setTarget1LexemeDetails] = useState<
    GlossWithSense[]
  >([]);
  const [target2LexemeDetails, setTarget2LexemeDetails] = useState<
    GlossWithSense[]
  >([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [singleLexemeObj, setSingleLexemeObj] = useState<any>(null);
  

  // Cache for filtered results to prevent unnecessary API calls
  const [dataCache, setDataCache] = useState<{
    sourceLang: GlossWithSense[];
    target1Lang: GlossWithSense[];
    target2Lang: GlossWithSense[];
    cacheKey: string;
  } | null>(null);
  
  // Generate cache key based on lexeme ID and language selections
  const cacheKey = useMemo(() => {
    if (!selectedLexeme?.lexeme?.id || !selectedSourceLanguage || !selectedTargetLanguage1 || !selectedTargetLanguage2) {
      return "";
    }
    return `${selectedLexeme.lexeme.id}_${selectedSourceLanguage.lang_code}_${selectedTargetLanguage1.lang_code}_${selectedTargetLanguage2.lang_code}`;
  }, [selectedLexeme?.lexeme?.id, selectedSourceLanguage?.lang_code, selectedTargetLanguage1?.lang_code, selectedTargetLanguage2?.lang_code]);


  // Check if we have cached data for current selection
  const hasValidCache = useMemo(() => {
    return dataCache?.cacheKey === cacheKey && cacheKey !== "";
  }, [dataCache, cacheKey]);
  
  const areLanguagesSelected =
    selectedSourceLanguage &&
    selectedTargetLanguage1 &&
    selectedTargetLanguage2;


  const [searchQuery, setSearchQuery] = useState(query || "");
  const [open, setOpen] = useState(false);
  const [contributingLanguage, setContributingLanguage] =
    useState<Language | null>(null);
  const [contributingType, setContributingType] = useState<
    "description" | "audio" | "translation" | null
  >(null);

  // Clear cache when language selections change (but not when just switching tabs)
  useEffect(() => {
    if (selectedSourceLanguage && selectedTargetLanguage1 && selectedTargetLanguage2) {
      // If languages have changed, clear the cache to force new API call
      setDataCache(null);
    }
  }, [selectedSourceLanguage?.lang_code, selectedTargetLanguage1?.lang_code, selectedTargetLanguage2?.lang_code]);
  const token = useAuthStore((state) => state.token);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    getLanguages();
  }, []);

  useEffect(() => {
    if (clickedLexeme && clickedLexeme.id) {
      if (clickedLexeme.id !== lexemeId) {
        router.push(`/results/${encodeURIComponent(clickedLexeme.id)}`);
      }
      handleGetLexemeDetails();
    }
  }, [clickedLexeme]);


  useEffect(() => {
    if (!selectedLexeme || !selectedLexeme.lexeme || !selectedLexeme.glosses) {
      return;
    }

    setSingleLexemeObj(selectedLexeme.lexeme);

    // Use cached data if available, otherwise filter and cache
    if (hasValidCache && dataCache) {
      setSourceLexemeDetails(dataCache.sourceLang);
      setTarget1LexemeDetails(dataCache.target1Lang);
      setTarget2LexemeDetails(dataCache.target2Lang);
    } else {
      // Filter glosses by language and cache the results
      const sourceLang = selectedLexeme.glosses.filter(
        (gloss: GlossWithSense) =>
          gloss.gloss.language === selectedSourceLanguage?.lang_code
      );
      const target1Lang = selectedLexeme.glosses.filter(
        (gloss: GlossWithSense) =>
          gloss.gloss.language === selectedTargetLanguage1?.lang_code
      );
      const target2Lang = selectedLexeme.glosses.filter(
        (gloss: GlossWithSense) =>
          gloss.gloss.language === selectedTargetLanguage2?.lang_code
      );

      setSourceLexemeDetails(sourceLang);
      setTarget1LexemeDetails(target1Lang);
      setTarget2LexemeDetails(target2Lang);

      // Update cache if we have a valid cache key
      if (cacheKey) {
        setDataCache({
          sourceLang,
          target1Lang,
          target2Lang,
          cacheKey,
        });
      }
    }
  }, [selectedLexeme, selectedSourceLanguage?.lang_code, selectedTargetLanguage1?.lang_code, selectedTargetLanguage2?.lang_code, hasValidCache, dataCache, cacheKey]);


  const handleGetLexemeDetails = useCallback(async () => {
    if (
      !selectedSourceLanguage ||
      (!selectedTargetLanguage1 && !selectedTargetLanguage2)
    ) {
      toast({
        title: "Languages required",
        description:
          "Please select source and target languages to get details.",
        variant: "destructive",
      });
      return;
    }

    // Skip API call if we have valid cached data for this language combination
    if (hasValidCache && dataCache) {
      console.log("Using cached data, skipping API call");
      return;
    }

    setIsLoadingDetails(true);
    try {
      await getLexemeDetails();
      await getLexemeTranslations();
    } catch (error) {
      console.error("Failed to get lexeme details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [
    selectedSourceLanguage?.lang_code,
    selectedTargetLanguage1?.lang_code,
    selectedTargetLanguage2?.lang_code,
    getLexemeDetails,
    getLexemeTranslations,
    hasValidCache,
    dataCache,
  ]);

  const handleContribute = (
    type: "description" | "audio" | "translation" | null,
    language: Language | null
  ) => {
    if (!language) {
      return;
    }
    setOpen(true);
    setContributingLanguage(language);
    setContributingType(type);
  };


  const onContributeSuccess = async () => {
    // Clear cache since new data has been added
    setDataCache(null);
    
    // toast success
    toast({
      title: "Contribution saved",
      description: "Thank you for your contribution. We appreciate your help!",
      variant: "success",
      duration: 3000,
      position: "top-right",
    });
    await getLexemeDetails();
    await getLexemeTranslations();
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#ffffff" }}
    >
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Title */}
          <div className="mb-8">
            <h1
              className="text-xl font-medium mb-4"
              style={{ color: "#72777d", fontStyle: "italic" }}
            >
              Select languages to search
            </h1>
          </div>

          {/* Search Interface */}
          <div className="mb-8">
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
                />
              </div>
            </div>

            <SearchInput
              disabled={!areLanguagesSelected}
              onSearch={(v) => null}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* Translation Details */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Column 1: Source Language Results */}
            <div className="lg:col-span-2">
              <h3
                className="text-lg font-medium mb-2"
                style={{ color: "#222222" }}
              >
                Source Language (
                {selectedSourceLanguage?.lang_label || "Not selected"})
              </h3>
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #a2a9b1",
                }}
              >
                {isLoadingDetails && (
                  <div className="text-center py-8">
                    <Spinner
                      loading={isLoadingDetails}
                      content="Loading details..."
                    />
                  </div>
                )}
                <LexemeDetailResultComponent
                  glossesWithSense={sourceLexemeDetails}
                  lexemeDetail={singleLexemeObj}
                  translation={null}
                    // lexemeTranslations &&
                    // lexemeTranslations.find(
                    //   (t: LexemeTranslation) =>
                    //     t.trans_language === selectedSourceLanguage?.lang_code
                    // )
                  // }
                  title={
                    selectedSourceLanguage?.lang_label || "Source Language"
                  }
                  onContribute={() =>
                    handleContribute("description", selectedSourceLanguage)
                  }
                />
              </div>
            </div>

            {/* Column 2: Target Languages Results */}
            <div className="lg:col-span-3">
              <h3
                className="text-lg font-medium mb-4"
                style={{ color: "#222222" }}
              >
                Target Languages
              </h3>

              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #a2a9b1",
                }}
              >
                {isLoadingDetails && (
                  <div className="text-center py-8">
                    <Spinner
                      loading={isLoadingDetails}
                      content="Loading details..."
                    />
                  </div>
                )}
                <Tabs defaultValue="target1" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="target1">
                      {selectedTargetLanguage1?.lang_label || "Target 1"}
                    </TabsTrigger>
                    <TabsTrigger value="target2">
                      {selectedTargetLanguage2?.lang_label || "Target 2"}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="target1" className="mt-4">
                    <LexemeDetailResultComponent
                      glossesWithSense={target1LexemeDetails}
                      translation={
                        lexemeTranslations &&
                        lexemeTranslations.find(
                          (t: LexemeTranslation) =>
                            t.trans_language ===
                            selectedTargetLanguage1?.lang_code
                        )
                      }
                      title={selectedTargetLanguage1?.lang_label || "Target 1"}
                      onContribute={(type) =>
                        handleContribute(type, selectedTargetLanguage1)
                      }
                    />
                  </TabsContent>

                  <TabsContent value="target2" className="mt-4">
                    <LexemeDetailResultComponent
                      glossesWithSense={target2LexemeDetails}
                      title={selectedTargetLanguage2?.lang_label || "Target 2"}
                      translation={
                        lexemeTranslations &&
                        lexemeTranslations.find(
                          (t: LexemeTranslation) =>
                            t.trans_language ===
                            selectedTargetLanguage2?.lang_code
                        )
                      }
                      onContribute={(type) =>
                        handleContribute(type, selectedTargetLanguage2)
                      }
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {lexemeError && (
            <div
              className="border rounded p-4 text-center"
              style={{
                backgroundColor: "#fef2f2",
                borderColor: "#fecaca",
              }}
            >
              <p style={{ color: "#dc2626" }}>Error: {lexemeError}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {!token ? (
        <GuessContribute open={open} onOpenChange={setOpen} />
      ) : (
        <>
          <ContributeAudioModal
            open={contributingType === "audio" && open ? true : false}
            onOpenChange={setOpen}
            language={contributingLanguage}
            onSuccess={onContributeSuccess}
          />
          <ContributeDescriptionModal
            open={contributingType === "description" && open ? true : false}
            onOpenChange={setOpen}
            language={contributingLanguage}
            onSuccess={onContributeSuccess}
          />
          <ContributeTranslationModal
            open={contributingType === "translation" && open ? true : false}
            lexemeTranslations={lexemeTranslations}
            onOpenChange={setOpen}
            language={contributingLanguage}
            onSuccess={onContributeSuccess}
          />
        </>
      )}
      <Toaster />
    </div>
  );
}
