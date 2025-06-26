import React, { useState, useCallback, useEffect } from 'react';
import ForgeReconciler, { Select, useProductContext } from '@forge/react';
import { CustomFieldEdit } from '@forge/react/jira';
import { view } from '@forge/bridge';
import { options } from './config.js';

const DEFAULT_LIMIT = 50;

const Edit = () => {
  // Transform options from config.js to Select component format
  const allOptions = options.map(option => ({
    label: option,
    value: option
  }));

  const [value, setValue] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState(allOptions.slice(0, DEFAULT_LIMIT));
  const [inputValue, setInputValue] = useState('');
  const context = useProductContext();

  useEffect(() => {
    // Ensure context is available before proceeding
    if (!context) {
      return;
    }
    console.log(`CUSTOMFIELD_TYPE | Context received: ${JSON.stringify(context, null, 2)}`);
    
    // Parse the field value - it might be a JSON string for multiselect
    let contextValue = context.extension.fieldValue || '';
    let parsedValue = [];
    
    if (contextValue) {
      try {
        // Try to parse as JSON array first
        parsedValue = JSON.parse(contextValue);
        if (!Array.isArray(parsedValue)) {
          // If it's not an array, treat as single value
          parsedValue = [contextValue];
        }
      } catch (e) {
        // If parsing fails, treat as single value
        parsedValue = [contextValue];
      }
    }
    
    setValue(parsedValue);
    console.log(`CUSTOMFIELD_TYPE | Initial values set:`, parsedValue);
  }, [context]);

  const onSubmit = useCallback(async () => {
    try {
      // Convert array to JSON string for submission
      const stringValue = value === null ? null : JSON.stringify(value);
      console.log(`CUSTOMFIELD_TYPE | Submitting multiselect values:`, value);
      console.log(`CUSTOMFIELD_TYPE | Submitting as JSON string: "${stringValue}"`);
      await view.submit(stringValue);

      console.log(`CUSTOMFIELD_TYPE | Submit successful with values:`, value);

    } catch (e) {
      console.error('CUSTOMFIELD_TYPE | Submit error:', e);
    }
  }, [view, value]);

  const handleOnChange = useCallback((selectedOptions) => {
    console.log(`CUSTOMFIELD_TYPE | handleOnChange | Options selected:`, selectedOptions);
    // selectedOptions is an array of {label, value} objects
    const selectedValues = selectedOptions && selectedOptions.length > 0
      ?  selectedOptions.map(option => option.value) 
      : null;
    setValue(selectedValues);
  }, []);

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

    setFilteredOptions(filtered);
  }, [allOptions]);

  return (
    <CustomFieldEdit onSubmit={onSubmit} hideActionButtons>
      <Select
        appearance="default"
        options={filteredOptions}
        value={value ? value.map(val => ({ label: val, value: val })) : null}
        inputValue={inputValue}
        onChange={handleOnChange}
        onInputChange={handleInputChange}
        placeholder="Select options..."
        isClearable={true}
        isSearchable={true}
        isMulti={true}
      />
    </CustomFieldEdit>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <Edit />
  </React.StrictMode>
);
