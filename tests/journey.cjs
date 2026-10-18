// Compatibility entry point: the user flow is now four independent five-room stages.
if(process.env.NAIVE_PLAY==='1')process.env.NOVICE='1';
require('./stage-journey.cjs');
