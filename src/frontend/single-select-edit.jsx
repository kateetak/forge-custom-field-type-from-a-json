import React, { useState, useCallback, useEffect } from 'react';
import ForgeReconciler, { Select, useProductContext } from '@forge/react';
import { CustomFieldEdit } from '@forge/react/jira';
import { view } from '@forge/bridge';
import { options } from './config.js';

const DEFAULT_LIMIT = 20;

const Edit = () => {
  // Transform options from config.js to Select component format
  const allOptions = options.map(option => ({
    label: option,
    value: option
  }));

  const [value, setValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(allOptions.slice(0, DEFAULT_LIMIT));
  const [inputValue, setInputValue] = useState('');
  const context = useProductContext();

  useEffect(() => {
    // Ensure context is available before proceeding
    if (!context) {
      return;
    }
    console.log(`CUSTOMFIELD_TYPE | Context received: ${JSON.stringify(context, null, 2)}`);
    setValue(context.extension.fieldValue || '');
    // Always ensure the currently selected value is included in the options
    let filtered = allOptions.slice(0, DEFAULT_LIMIT);
    if (value && !filtered.find(option => option.value === value)) {
      const selectedOption = allOptions.find(option => option.value === value);
      if (selectedOption) {
        // Add the selected option at the beginning and adjust the slice
        filtered = [selectedOption, ...filtered.slice(0, DEFAULT_LIMIT - 1)];
      }
    }
    setFilteredOptions(filtered);
    console.log(`CUSTOMFIELD_TYPE | Initial value set: "${context.extension.fieldValue || ''}"`);
  }, [context]);

  const onSubmit = useCallback(async () => {
    try {
      // Ensure we always submit a string value
      const stringValue = value || '';
      console.log(`CUSTOMFIELD_TYPE | Submitting value: "${stringValue}" (type: ${typeof stringValue})`);
      await view.submit(stringValue);

      console.log(`CUSTOMFIELD_TYPE | Submit successful with value: ${value}`);

    } catch (e) {
      console.error('CUSTOMFIELD_TYPE | Submit error:', e);
    }
  }, [view, value]);

  const handleOnChange = useCallback((e) => {
    console.log(`CUSTOMFIELD_TYPE | handleOnChange | Option selected: ${JSON.stringify(e, null, 2)}`);
    setValue(e.value);
  }, []);

  // Effect to ensure selected value is always in filteredOptions
  useEffect(() => {
    if (value) {
      const currentFiltered = filteredOptions;
      // Check if the selected value is in the current filtered options
      if (!currentFiltered.find(option => option.value === value)) {
        const selectedOption = allOptions.find(option => option.value === value);
        if (selectedOption) {
          // Add the selected option at the beginning
          const newFiltered = [selectedOption, ...currentFiltered.slice(0, DEFAULT_LIMIT - 1)];
          setFilteredOptions(newFiltered);
        }
      }
    }
  }, [allOptions, filteredOptions, value]);


  const handleInputChange = useCallback((inputValue) => {
    setInputValue(inputValue);

    let filtered;
    if (!inputValue) {
      filtered = allOptions.slice(0, DEFAULT_LIMIT);
    } else {
      // Filter options based on input
      filtered = allOptions.filter(option =>
        option.label.toLowerCase().includes(inputValue.trim().toLowerCase())
      ).slice(0, DEFAULT_LIMIT);
    }

    // Always ensure the currently selected value is included in the options
    if (value && !filtered.find(option => option.value === value)) {
      const selectedOption = allOptions.find(option => option.value === value);
      if (selectedOption) {
        // Add the selected option at the beginning and adjust the slice
        filtered = [selectedOption, ...filtered.slice(0, DEFAULT_LIMIT - 1)];
      }
    }

    setFilteredOptions(filtered);
    //console.log('Filtered options for input:', inputValue, filtered.slice(0, DEFAULT_LIMIT));
  }, [allOptions, value]);

  return (
    <CustomFieldEdit onSubmit={onSubmit} hideActionButtons>
      <Select
        appearance="default"
        options={filteredOptions}
        value={value}
        inputValue={inputValue}
        onChange={handleOnChange}
        onInputChange={handleInputChange}
        placeholder="Select an option..."
        isClearable={true}
        isSearchable={true}
      />
    </CustomFieldEdit>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <Edit />
  </React.StrictMode>
);
