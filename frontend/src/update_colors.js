const fs = require('fs');
const files = [
  'src/pages/RecruiterDashboard.jsx',
  'src/pages/JobSeekerDashboard.jsx',
  'src/pages/JobDetails.jsx',
  'src/App.css',
  'src/index.css'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/99, 102, 241/g, '59, 130, 246');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } catch(e){
    console.log(`Failed ${file}:`, e.message);
  }
});
