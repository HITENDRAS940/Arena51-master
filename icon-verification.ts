import { Ionicons } from '@expo/vector-icons';

// List of all icon names we're using in the app
const iconsUsed = [
  // Navigation icons
  'bar-chart',
  'bar-chart-outline', 
  'football',
  'football-outline',
  'calendar',
  'calendar-outline',
  'ellipsis-horizontal',
  'ellipsis-horizontal-outline',
  'person',
  'person-outline',
  
  // Dashboard stat icons
  'calendar-outline',
  'cash-outline',
  'calendar-number-outline',
  
  // Other common icons
  'star',
  'star-outline',
  'location',
  'location-outline',
  'time-outline',
  'call-outline',
  'search-outline',
  'arrow-forward',
  'arrow-back',
  'checkmark-circle',
  'pencil',
  'trash',
  'add',
  'close',
  'home',
];

// Check which icons are valid
console.log('=== ICON VERIFICATION REPORT ===\n');

const validIcons: string[] = [];
const invalidIcons: string[] = [];

iconsUsed.forEach(iconName => {
  if (iconName in Ionicons.glyphMap) {
    validIcons.push(iconName);
    console.log(`✅ ${iconName} - VALID`);
  } else {
    invalidIcons.push(iconName);
    console.log(`❌ ${iconName} - INVALID`);
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Valid icons: ${validIcons.length}`);
console.log(`Invalid icons: ${invalidIcons.length}`);

if (invalidIcons.length > 0) {
  console.log(`\n=== INVALID ICONS THAT NEED FIXING ===`);
  invalidIcons.forEach(icon => {
    console.log(`❌ ${icon}`);
  });
  
  console.log(`\n=== SUGGESTED REPLACEMENTS ===`);
  console.log(`❌ calendar-number-outline → ✅ today-outline`);
  console.log(`❌ ellipsis-horizontal-outline → ✅ ellipsis-horizontal`);
  console.log(`❌ bar-chart-outline → ✅ analytics-outline`);
}

export {};
