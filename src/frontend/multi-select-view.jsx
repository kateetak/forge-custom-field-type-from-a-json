import React, { useState, useEffect } from 'react';
import ForgeReconciler, {
  Text,
  Stack,
  Box,
} from "@forge/react";
import { view } from '@forge/bridge';

const LOG_PREFIX = 'CUSTOMFIELD_TYPE | multi-select-view';

const View = () => {
  const [fieldValue, setFieldValue] = useState(null);
  const [parsedValues, setParsedValues] = useState([]);

  useEffect(() => {
    console.log(`${LOG_PREFIX} | Component mounted, fetching context...`);
    
    view.getContext().then((context) => { 
      console.log(`${LOG_PREFIX} | Context received: ${JSON.stringify(context, null, 2)}`);
      const rawValue = context.extension.fieldValue;
      console.log(`${LOG_PREFIX} | Raw field value:`, rawValue);
      setFieldValue(rawValue);
      
      // Field value is now directly an array object, not a JSON string
      let parsed = [];
      if (rawValue) {
        if (Array.isArray(rawValue)) {
          // Already an array, use as-is
          parsed = rawValue;
          console.log(`${LOG_PREFIX} | Field value is already an array:`, parsed);
        } else if (typeof rawValue === 'string') {
          try {
            // Try to parse as JSON string (for backward compatibility)
            parsed = JSON.parse(rawValue);
            if (!Array.isArray(parsed)) {
              parsed = [rawValue];
              console.log(`${LOG_PREFIX} | Converted JSON string to array:`, parsed);
            } else {
              console.log(`${LOG_PREFIX} | Parsed JSON string array:`, parsed);
            }
          } catch (e) {
            // If parsing fails, treat as single value
            parsed = [rawValue];
            console.log(`${LOG_PREFIX} | JSON parse failed, treating as single value:`, parsed);
          }
        } else {
          // Other type, treat as single value
          parsed = [rawValue];
          console.log(`${LOG_PREFIX} | Converting non-array value to array:`, parsed);
        }
      } else {
        console.log(`${LOG_PREFIX} | No field value present, using empty array`);
      }
      
      setParsedValues(parsed);
      console.log(`${LOG_PREFIX} | Final parsed values set:`, parsed);
    }).catch(error => {
      console.error(`${LOG_PREFIX} | Error fetching context:`, error);
    });
  }, []);

  // Render the values in a user-friendly format
  const renderValues = () => {
    console.log(`${LOG_PREFIX} | Rendering values, parsedValues:`, parsedValues);
    
    if (!parsedValues || parsedValues.length === 0) {
      console.log(`${LOG_PREFIX} | No values to display`);
      return <Text appearance="subtle">No selections</Text>;
    }

    if (parsedValues.length === 1) {
      console.log(`${LOG_PREFIX} | Displaying single value:`, parsedValues[0]);
      return (
        <Box backgroundColor="color.background.neutral" padding="space.100">
          <Text>{parsedValues[0]}</Text>
        </Box>
      );
    }

    // For multiple values, display each in a box with alternating colors
    console.log(`${LOG_PREFIX} | Displaying multiple values (${parsedValues.length} items)`);
    return (
      <Stack 
        space="space.050"
        xcss={{
          borderColor: 'color.border.information', 
          borderWidth: 'border.width.100', 
          borderStyle: 'solid', 
          padding: 'space.100', 
          borderRadius: 'border.radius.100'
        }}
      >
        {parsedValues.map((value, index) => {
          const isEven = index % 2 === 0;
          const backgroundColor = isEven ? "color.background.neutral" : "color.background.neutral.subtle";
          
          console.log(`${LOG_PREFIX} | Rendering item ${index + 1}/${parsedValues.length}:`, value);
          
          return (
            <Box 
              key={index} 
              backgroundColor={backgroundColor} 
              xcss={{
                padding: 'space.025', 
                borderRadius: 'border.radius.100'
              }}
            >
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
