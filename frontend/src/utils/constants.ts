export const CROP_TYPES = [
    'Tomatoes',
    'Corn',
    'Lettuce',
    'Potatoes',
    'Beans',
    'Rice',
    'Wheat',
    'Carrots',
    'Cabbage',
    'Onions',
    'Peppers',
    'Cucumber',
    'Spinach',
    'Broccoli',
    'Other'
  ] as const;
  
  export const PROJECT_PHASES = [
    'Planning',
    'Planting',
    'Growing',
    'Harvest',
    'Completed'
  ] as const;
  
  export const ACTIVITY_TYPES = [
    'investment',
    'milestone',
    'weather',
    'goal',
    'roi',
    'harvest',
    'update'
  ] as const;
  
  export const PHASE_COLORS = {
    'Planning': 'gray',
    'Planting': 'blue',
    'Growing': 'green',
    'Harvest': 'orange',
    'Completed': 'purple'
  } as const;
  
  export const ACTIVITY_COLORS = {
    'investment': 'green',
    'milestone': 'blue',
    'weather': 'orange',
    'goal': 'purple',
    'roi': 'teal',
    'harvest': 'yellow',
    'update': 'gray'
  } as const;
  