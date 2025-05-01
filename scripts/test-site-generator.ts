/**
 * Test script for the site generator
 * 
 * This script creates a mock schema and tests the site generator
 * by rendering HTML and CSS files and saving them to the test-output directory.
 */

import 'dotenv/config';
import { generateSiteFiles } from '../src/managers/siteGenerator.js';
import fs from 'fs/promises';
import path from 'path';

async function testSiteGenerator() {
  console.log('Testing site generator...');
  
  // Create a mock schema
  const mockSchema = {
    brandName: 'EcoTracker',
    palette: {
      primary: '#2E7D32',
      secondary: '#81C784',
      accent: '#FF5722'
    },
    font: {
      heading: 'Montserrat',
      body: 'Open Sans'
    },
    copyBlocks: {
      headline: 'Track your carbon footprint',
      subheadline: 'Simple tools to monitor and reduce your environmental impact',
      callToAction: 'Start tracking today'
    },
    imagePrompts: {
      hero: 'A digital dashboard showing carbon footprint metrics with green earth imagery',
      feature1: 'A person using a mobile app to scan a product barcode for environmental impact data'
    },
    formText: {
      title: 'Join the waitlist',
      submitButton: 'Sign me up'
    }
  };

  // Mock idea and preferences for content refinement test
  const selectedIdea = 'An app that helps users track and reduce their carbon footprint through daily activities';
  const designPreferences = 'modern and eco-friendly';
  
  // Call the site generator - testing with and without content refinement
  try {
    console.log('Generating site without content refinement...');
    const basicSite = await generateSiteFiles(mockSchema);
    
    console.log('Generating site with content refinement...');
    const refinedSite = await generateSiteFiles(
      { ...mockSchema }, // Clone to avoid modifying the original
      selectedIdea,
      designPreferences,
      true // Enable content refinement
    );

    // Create test output directory
    const testOutputDir = path.resolve(process.cwd(), 'test-output');
    await fs.mkdir(testOutputDir, { recursive: true });
    
    // Save the files
    await fs.writeFile(path.join(testOutputDir, 'basic-index.html'), basicSite.htmlContent);
    await fs.writeFile(path.join(testOutputDir, 'basic-style.css'), basicSite.cssContent);
    await fs.writeFile(path.join(testOutputDir, 'refined-index.html'), refinedSite.htmlContent);
    await fs.writeFile(path.join(testOutputDir, 'refined-style.css'), refinedSite.cssContent);
    
    console.log(`Files saved to ${testOutputDir}`);
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testSiteGenerator(); 