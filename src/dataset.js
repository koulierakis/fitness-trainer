export const DATASET_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
export const DATASET_REPO = 'https://github.com/yuhonas/free-exercise-db';
export const DATASET_MEDIA_ROOT = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
export const DATASET_LICENSE = 'Public Domain (Unlicense)';

const levelMap = { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Advanced' };
const equipmentMap = {'body only':'Bodyweight',dumbbell:'Αλτήρες',dumbbells:'Αλτήρες',bands:'Λάστιχα',band:'Λάστιχα',kettlebells:'Kettlebell',kettlebell:'Kettlebell','exercise ball':'Stability Ball','foam roll':'Foam Roller',machine:'Μηχάνημα',cable:'Τροχαλία',barbell:'Μπάρα','e-z curl bar':'EZ Bar',other:'Άλλο'};
const muscleGroupMap = {abdominals:'Κορμός',obliques:'Κορμός','lower back':'Πλάτη',lats:'Πλάτη','middle back':'Πλάτη',traps:'Πλάτη',chest:'Στήθος',shoulders:'Ώμοι',biceps:'Χέρια',triceps:'Χέρια',forearms:'Χέρια',quadriceps:'Πόδια',hamstrings:'Πόδια',calves:'Πόδια',adductors:'Πόδια',abductors:'Πόδια',glutes:'Γλουτοί',neck:'Αυχένας'};
const goalMap = {strength:'Strength',stretching:'Mobility',cardio:'Conditioning',plyometrics:'Power',strongman:'Strength',powerlifting:'Strength','olympic weightlifting':'Power'};
const titleCase = value => String(value || '').replace(/\b\w/g, m => m.toUpperCase());
const first = value => Array.isArray(value) && value.length ? value[0] : '';
export function toFitnessExercise(item, mediaEnabled=true){
 const primary=item.primaryMuscles||[], secondary=item.secondaryMuscles||[], primaryMuscle=first(primary);
 const images=Array.isArray(item.images)?item.images.map(path=>`${DATASET_MEDIA_ROOT}${path}`):[];
 return {id:`free-db:${item.id}`,datasetId:item.id,source:'free-exercise-db',name:item.name,gr:item.name,group:muscleGroupMap[primaryMuscle]||titleCase(primaryMuscle||item.category),sourceBodyPart:primaryMuscle,equipment:equipmentMap[item.equipment]||titleCase(item.equipment||'Bodyweight'),sourceEquipment:item.equipment,level:levelMap[item.level]||titleCase(item.level||'Intermediate'),goal:goalMap[item.category]||titleCase(item.category||'Strength'),target:primaryMuscle,muscleGroup:primary.join(', '),secondary,instructions:Array.isArray(item.instructions)?item.instructions.join(' '):(item.instructions||''),instructionSteps:Array.isArray(item.instructions)?item.instructions:[],cues:Array.isArray(item.instructions)?item.instructions.slice(0,3):[],cue:Array.isArray(item.instructions)?(item.instructions[0]||''):'',mistakes:[],regression:'Δεν παρέχεται από το source dataset.',progression:'Δεν παρέχεται από το source dataset.',reps:'—',rest:30,safety:'Open exercise metadata from free-exercise-db. Validate technique and individual suitability before coaching use.',attribution:DATASET_LICENSE,media:{id:item.id,type:'remote-image-sequence',enabled:mediaEnabled,imageUrls:images,imageUrl:images[0]||'',sourcePath:item.images?.[0]||''}};
}
export async function loadDatasetExercises({signal}={}){const response=await fetch(DATASET_URL,{signal,cache:'force-cache'});if(!response.ok)throw new Error(`Dataset HTTP ${response.status}`);const data=await response.json();if(!Array.isArray(data))throw new Error('Dataset response is not an array');const mediaEnabled=import.meta.env.VITE_ENABLE_EXERCISE_MEDIA!=='false';return data.map(item=>toFitnessExercise(item,mediaEnabled));}
