const fs = require('fs');
const { exec } = require('child_process');
const projectTypes = {
  library: 'libraries',
  application: 'applications'
};

function readAngularJson() {
  try {
    const data = fs.readFileSync('./angular.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    throw err;
  }
}

function generateBuildProjects() {
  const angularJson = readAngularJson();
  const projects = angularJson.projects;
  const projectsKeys = Object.keys(projects).filter((key) => {
    return key.indexOf('e2e') < 0 && key !== angularJson.defaultProject;
  });
  const buildProjects = {
    libraries: [],
    applications: [],
    defaultProject: angularJson.defaultProject
  };

  projectsKeys.forEach((pk) => {
    const project = projects[pk];
    const projectType = projectTypes[project.projectType];

    buildProjects[projectType].push(pk);
  });

  return buildProjects;
}

function buildAll() {
  const bp = generateBuildProjects();
  const projects = [
    ...bp.libraries,
    ...bp.applications,
    bp.defaultProject
  ];
  build(projects);
}

function build(projects) {
  const project = projects.shift();
  console.log('Started building', project);

  const child = exec(`ng build ${project} --prod`, (err, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
  });

  child.on('close', () => {
    if (projects.length) build(projects);
    else console.log('finished');
  });
}

buildAll();