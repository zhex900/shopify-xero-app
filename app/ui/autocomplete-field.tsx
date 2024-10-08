import { Autocomplete, Icon } from "@shopify/polaris";
import { useCallback, useEffect, useMemo, useState } from "react";

export function AutocompleteField({
  icon,
  label,
  options: _options,
  inputValue,
  setInputValue,
  placeholder,
  errorMessage,
}: {
  label: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  options: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  placeholder: string;
  errorMessage: string;
}) {
  const deselectedOptions = useMemo(
    () =>
      _options.map((option) => ({
        value: option,
        label: option,
      })),
    [_options],
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [options, setOptions] = useState(deselectedOptions);

  const updateText = useCallback(
    (value: string) => {
      setInputValue(value);

      if (value === "") {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex),
      );
      setOptions(resultOptions);
    },
    [deselectedOptions, setInputValue],
  );

  const updateSelection = useCallback(
    (selected: string[]) => {
      const selectedValue = selected.map((selectedItem) => {
        const matchedOption = options.find((option) => {
          return option.value.includes(selectedItem);
        });
        return matchedOption && matchedOption.label;
      });

      setSelectedOptions(selected);
      setInputValue(selectedValue[0] || "");
    },
    [options, setInputValue],
  );

  const [isValid, setIsValid] = useState(true);
  useEffect(() => {
    //if it is empty
    if (inputValue === "") {
      setIsValid(true);
      return;
    }

    setIsValid(
      options.some((option) => {
        return option.label === inputValue;
      }),
    );
  }, [inputValue, options, selectedOptions]);
  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label={label}
      value={inputValue}
      prefix={<Icon source={icon} tone="base" />}
      placeholder={placeholder}
      autoComplete="off"
      error={!isValid ? errorMessage : undefined}
    />
  );

  return (
    <Autocomplete
      options={options}
      selected={selectedOptions}
      onSelect={updateSelection}
      textField={textField}
    />
  );
}
