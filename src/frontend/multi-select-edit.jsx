import React, { useState, useCallback, useEffect } from 'react';
import ForgeReconciler, { Select, useProductContext } from '@forge/react';
import { CustomFieldEdit } from '@forge/react/jira';
import { view } from '@forge/bridge';
import { options } from './config.js';

const DEFAULT_LIMIT = 50;
const LOG_PREFIX = 'CUSTOMFIELD_TYPE | multi-select-edit';

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
    console.log(`${LOG_PREFIX} | Context received: ${JSON.stringify(context, null, 2)}`);
    
    // Field value is always either an array or null
    const contextValue = context.extension.fieldValue;
    
    setValue(contextValue);
    console.log(`${LOG_PREFIX} | Initial values set:`, contextValue);
  }, [context]);

  const onSubmit = useCallback(async () => {
    try {
      // Submit the array/null value as JSON object
      console.log(`${LOG_PREFIX} | Submitting multiselect values:`, value);
      //console.log(`${LOG_PREFIX} | Submitting multiselect values as JSON:`, JSON.stringify(value));
      await view.submit(value);

      console.log(`${LOG_PREFIX} | Submit successful with values:`, value);

    } catch (e) {
      console.error(`${LOG_PREFIX} | Submit error:`, e);
    }
  }, [view, value]);

  const handleOnChange = useCallback((selectedOptions) => {
    console.log(`${LOG_PREFIX} | handleOnChange | Options selected:`, selectedOptions);
    // selectedOptions is an array of {label, value} objects
    
    const selectedValues = selectedOptions && selectedOptions.length > 0 
      ? selectedOptions.map(option => option.value) 
      : null;
    
    console.log(`${LOG_PREFIX} | handleOnChange | Selected values (indices):`, selectedValues);
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
