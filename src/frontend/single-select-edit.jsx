import React, { useState, useCallback, useEffect } from 'react';
import ForgeReconciler, { Select, useProductContext } from '@forge/react';
import { CustomFieldEdit } from '@forge/react/jira';
import { view, invoke } from '@forge/bridge';

const DEFAULT_LIMIT = 50;
const LOG_PREFIX = 'CUSTOMFIELD_TYPE | single-select-edit';

const Edit = () => {
  const [allOptions, setAllOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const context = useProductContext();

  // Fetch F1 drivers from backend resolver
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        console.log(`${LOG_PREFIX} | Fetching F1 drivers from backend resolver...`);
        const drivers = await invoke('get-drivers');
        
        console.log(`${LOG_PREFIX} | Received ${drivers.length} drivers from resolver`);
        
        // Extract unique full names and create options
        const uniqueDrivers = drivers.reduce((acc, driver) => {
          if (!acc.find(d => d.full_name === driver.full_name)) {
            acc.push(driver);
          }
          return acc;
        }, []);
        
        const driverOptions = uniqueDrivers.map(driver => ({
          label: driver.full_name,
          value: driver.full_name
        }));
        
        console.log(`${LOG_PREFIX} | Created ${driverOptions.length} unique driver options`);
        setAllOptions(driverOptions);
        setFilteredOptions(driverOptions.slice(0, DEFAULT_LIMIT));
        setLoading(false);
      } catch (error) {
        console.error(`${LOG_PREFIX} | Error fetching drivers from resolver:`, error);
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  useEffect(() => {
    // Ensure context is available before proceeding
    if (!context || loading) {
      return;
    }
    console.log(`${LOG_PREFIX} | Context received: ${JSON.stringify(context, null, 2)}`);
    setValue(context.extension.fieldValue || '');
    // Always ensure the currently selected value is included in the options
    let filtered = allOptions.slice(0, DEFAULT_LIMIT);
    const fieldValue = context.extension.fieldValue || '';
    if (fieldValue && !filtered.find(option => option.value === fieldValue)) {
      const selectedOption = allOptions.find(option => option.value === fieldValue);
      if (selectedOption) {
        // Add the selected option at the beginning and adjust the slice
        filtered = [selectedOption, ...filtered.slice(0, DEFAULT_LIMIT - 1)];
      }
    }
    setFilteredOptions(filtered);
    console.log(`${LOG_PREFIX} | Initial value set: "${fieldValue}"`);
  }, [context, allOptions, loading]);

  const onSubmit = useCallback(async () => {
    try {
      // Ensure we always submit a string value
      const stringValue = value || '';
      console.log(`${LOG_PREFIX} | Submitting value: "${stringValue}" (type: ${typeof stringValue})`);
      await view.submit(stringValue);

      console.log(`${LOG_PREFIX} | Submit successful with value: ${value}`);

    } catch (e) {
      console.error(`${LOG_PREFIX} | Submit error:`, e);
    }
  }, [view, value]);

  const handleOnChange = useCallback((e) => {
    console.log(`${LOG_PREFIX} | handleOnChange | Option selected: ${JSON.stringify(e, null, 2)}`);
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
          placeholder="Select an F1 driver..."
          isLoading={loading}
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
