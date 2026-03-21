var session = globalThis.__appiumDriver;
var currentPackage;
var currentActivity;

if (!session) {
  console.log("missing or unhealthy: session");
} else {
  try {
    currentPackage = await session.getCurrentPackage();
  } catch (error) {}
  try {
    currentActivity = await session.getCurrentActivity();
  } catch (error) {}
  console.log(JSON.stringify({ currentPackage, currentActivity }, null, 2));
}
