window.onload = function() {
    window.api.send("cleanUp");

    window.api.receive("cleanedUp", (message) => {
        return;
    });
}