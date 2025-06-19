import React, { useState, useEffect } from 'react';
import ForgeReconciler, {
  Text,
  Tag,
  Inline,
} from "@forge/react";
import { view } from '@forge/bridge';

const View = () => {
  const [fieldValue, setFieldValue] = useState(null);
  const [parsedValues, setParsedValues] = useState([]);

  useEffect(() => {
    view.getContext().then((context) => { 
      //console.log(`Context received: ${JSON.stringify(context, null, 2)}`);
      const rawValue = context.extension.fieldValue;
      setFieldValue(rawValue);
      
      // Parse the field value to extract the array of selected items
      let parsed = [];
      if (rawValue) {
        try {
          parsed = JSON.parse(rawValue);
          if (!Array.isArray(parsed)) {
            // If it's not an array, treat as single value
            parsed = [rawValue];
          }
        } catch (e) {
          // If parsing fails, treat as single value
          parsed = [rawValue];
        }
      }
      setParsedValues(parsed);
    });
  }, []);

  // Render the values in a user-friendly format
  const renderValues = () => {
    if (!parsedValues || parsedValues.length === 0) {
      return <Text appearance="subtle">No selections</Text>;
    }

    if (parsedValues.length === 1) {
      return <Text>{parsedValues[0]}</Text>;
    }

    // For multiple values, display as tags
    return (
      <Inline space="space.050">
        {parsedValues.map((value, index) => (
          <Tag key={index} text={value} />
        ))}
      </Inline>
    );
  };

  return (
    <>
      {renderValues()}
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <View />
  </React.StrictMode>
);
