import { Combobox, Icon, Listbox, Tag } from "@shopify/polaris";
import { useCallback, useMemo, useState } from "react";

export function MultiselectCombobox({
  icon,
  label,
  options: _options,
  selectedOptions,
  setSelectedOptions,
  placeholder,
}: {
  label: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  options: string[];
  selectedOptions: string[];
  setSelectedOptions: (value: string[]) => void;
  placeholder: string;
}) {
  const deselectedOptions = useMemo(
    () =>
      _options.map((option) => ({
        value: option,
        label: option,
      })),
    [_options],
  );

  const [options, setOptions] = useState(deselectedOptions);

  const escapeSpecialRegExCharacters = useCallback(
    (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    [],
  );
  const [inputValue, setInputValue] = useState("");
  const updateText = useCallback(
    (value: string) => {
      setInputValue(value);

      if (value === "") {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(escapeSpecialRegExCharacters(value), "i");
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex),
      );
      setOptions(resultOptions);
    },
    [deselectedOptions, escapeSpecialRegExCharacters],
  );

  const updateSelection = useCallback(
    (selected: string) => {
      if (selectedOptions.includes(selected)) {
        setSelectedOptions(
          selectedOptions.filter((option) => option !== selected),
        );
      } else {
        setSelectedOptions([...selectedOptions, selected]);
      }

      updateText("");
    },
    [selectedOptions, setSelectedOptions, updateText],
  );

  const removeTag = useCallback(
    (tag: string) => () => {
      const options = [...selectedOptions];
      options.splice(options.indexOf(tag), 1);
      setSelectedOptions(options);
    },
    [selectedOptions, setSelectedOptions],
  );

  const tagsMarkup = selectedOptions.map((option) => (
    <Tag key={`option-${option}`} onRemove={removeTag(option)}>
      {option}
    </Tag>
  ));

  const optionsMarkup =
    options.length > 0
      ? options.map((option) => {
          const { label, value } = option;

          return (
            <Listbox.Option
              key={`${value}`}
              value={value}
              selected={selectedOptions.includes(value)}
              accessibilityLabel={label}
            >
              {label}
            </Listbox.Option>
          );
        })
      : null;

  return (
    <>
      <Combobox
        allowMultiple
        activator={
          <Combobox.TextField
            prefix={<Icon source={icon} tone="base" />}
            onChange={updateText}
            label={label}
            value={inputValue}
            placeholder={placeholder}
            autoComplete="off"
          />
        }
      >
        {optionsMarkup ? (
          <Listbox onSelect={updateSelection}>{optionsMarkup}</Listbox>
        ) : null}
      </Combobox>
      <div
        style={{
          display: "flex",
          columnGap: 10,
          rowGap: 10,
          flexWrap: "wrap",
        }}
      >
        {tagsMarkup}
      </div>
    </>
  );
}
