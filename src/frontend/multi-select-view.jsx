import React, { useState, useEffect } from 'react';
import ForgeReconciler, {
  Text,
  Stack,
  Box,
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
      return (
        <Box backgroundColor="color.background.neutral" padding="space.100">
          <Text>{parsedValues[0]}</Text>
        </Box>
      );
    }

    // For multiple values, display each in a box with alternating colors
    return (
      <Stack space="space.050">
        {parsedValues.map((value, index) => {
          const isEven = index % 2 === 0;
          const backgroundColor = isEven ? "color.background.neutral" : "color.background.neutral.subtle";
          
          return (
            <Box key={index} backgroundColor={backgroundColor} padding="space.100">
              <Text>{value}</Text>
            </Box>
          );
        })}
      </Stack>
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
