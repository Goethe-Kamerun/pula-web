"use client";

import { useLanguageStore } from "@/lib/stores";
import Spinner from "./spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  span?: string;
  excludedLanguages?: string[];
}

export default function LanguageSelect({
  value,
  onChange,
  placeholder = "Select language",
  label,
  span,
  excludedLanguages = [],
}: LanguageSelectProps) {
  const { languages, loading, error } = useLanguageStore();

  // Filter languages based on excluded languages
  const filteredLanguages = languages.filter(
    (language) => !excludedLanguages.includes(language.lang_code)
  );

  return (
    <div>
      <div className="flex items-center mb-2">
        {label && (
          <>
            <label
              className="block text-sm font-medium"
              style={{ color: "#222222" }}
            >
              {label}
            </label>
            {span && <span className="text-sm text-red-500 ml-1">{span}</span>}
            <Spinner loading={loading} />
          </>
        )}
      </div>

      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger
          className="w-full bg-white"
          style={{
            borderColor: "#a2a9b1",
            color: value ? "#222222" : "#72777d",
          }}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {filteredLanguages.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">
              No languages available
            </div>
          ) : (
            filteredLanguages.map((language) => (
              <SelectItem key={language.lang_code} value={language.lang_code}>
                {language.lang_label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
