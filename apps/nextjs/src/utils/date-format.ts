export function formatDateAndPreserveCursor(
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: string) => void,
) {
  const input = e.target;
  const raw = input.value;
  const initialCursor = input.selectionStart ?? raw.length;
  const initialLength = raw.length;

  // Strip non-digits and format to DD/MM/YYYY
  const digits = raw.replace(/\D/g, "").slice(0, 8);

  let formatted = "";
  if (digits.length > 0) formatted += digits.slice(0, 2);
  if (digits.length > 2) formatted += "/" + digits.slice(2, 4);
  if (digits.length > 4) formatted += "/" + digits.slice(4, 8);

  const formattedLength = formatted.length;
  const cursorOffset = formattedLength - initialLength;
  const newCursor = initialCursor + cursorOffset;

  onChange(formatted);

  requestAnimationFrame(() => {
    input.setSelectionRange(newCursor, newCursor);
  });
}
