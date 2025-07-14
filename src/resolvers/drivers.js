import Resolver from '@forge/resolver';
import { fetch } from '@forge/api';

const resolver = new Resolver();

const getDrivers = async () => {
  try {
    console.log('F1 Drivers Resolver | Fetching drivers from OpenF1 API...');

    // Drivers for Silverstone 2025 - https://api.openf1.org/v1/sessions?year=2025
    const response = await fetch('https://api.openf1.org/v1/drivers?session_key=9947');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const drivers = await response.json();
    console.log(`F1 Drivers Resolver | Successfully fetched ${drivers.length} drivers`);
    
    return drivers;
  } catch (error) {
    console.error('F1 Drivers Resolver | Error fetching drivers:', error);
    throw error;
  }
};

// Resolver for frontend to get options from storage
resolver.define('get-drivers', async () => {
    console.log('F1 Drivers Resolver | Fetching drivers for frontend...');
    const drivers = await getDrivers();
    return drivers;
});


export const handler = resolver.getDefinitions();