#!/bin/bash

UI_DIR="components/ui"
UNUSED=()
USED=()

# Get list of all .tsx files (excluding use-toast.ts and use-mobile.tsx which are hooks)
for file in $UI_DIR/*.tsx; do
  if [[ "$file" == *"use-"* ]] || [[ "$file" == *".ts" ]]; then
    continue
  fi
  
  filename=$(basename "$file" .tsx)
  
  # Create regex patterns for common import formats
  # Pattern 1: from "@/components/ui/filename"
  # Pattern 2: from "../../ui/filename" or similar relative paths
  # Pattern 3: just the component name being used (e.g., <Accordion> for accordion.tsx)
  
  # Convert filename to component name (e.g., alert-dialog -> AlertDialog)
  component_name=$(echo "$filename" | sed 's/-\([a-z]\)/\U\1/g' | sed 's/^./\U&/')
  
  # Search for imports and usage
  count=$(grep -r "from.*['\"].*ui/$filename['\"]" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" . 2>/dev/null | grep -v "components/ui/" | grep -v ".next" | wc -l)
  
  if [ $count -gt 0 ]; then
    USED+=("$filename")
  else
    UNUSED+=("$filename")
  fi
done

echo "=== UI COMPONENT USAGE ANALYSIS ==="
echo ""
echo "UNUSED COMPONENTS (${#UNUSED[@]}):"
if [ ${#UNUSED[@]} -eq 0 ]; then
  echo "  None - all components are used"
else
  for comp in "${UNUSED[@]}"; do
    echo "  - $comp"
  done
fi

echo ""
echo "USED COMPONENTS (${#USED[@]}):"
for comp in "${USED[@]}"; do
  echo "  ✓ $comp"
done
