// Requires a local HTTP server. Every child status is preserved; failures stop the suite.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.join(__dirname, '..');
const run = (file, env = {}) => {
  console.log('\nRunning ' + file + (env.NOVICE ? ' (no dodge)' : ''));
  const result = spawnSync(process.execPath, [file], { cwd:root, stdio:'inherit', env:{...process.env,...env} });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
};
const build = spawnSync(process.execPath, ['scripts/build.cjs','--check'], {cwd:root,stdio:'inherit'});
if (build.status !== 0) process.exit(build.status || 1);
for (const name of ['startup','epic','journey-ui','tuning','refinement','adventure','comfort','expansion','clear-flow','campaign','regions','campaign-usability','browser-smoke','terrain','polish','responsive','awakening','depth','progression','experience','rhythm','portability']) run('tests/'+name+'.cjs');
if (process.argv.includes('--journeys')) { run('tests/stage-journey.cjs'); run('tests/stage-journey.cjs',{NOVICE:'1'}); }
console.log('\nPASS selected browser suites');
