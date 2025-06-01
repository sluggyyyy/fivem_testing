onNet('announcer:showAnnouncement', (message) => {
    TriggerEvent('chatMessage', '^5[ANNOUNCEMENT]', [255, 255, 0], message);
    console.log(`[Announcer - Client] Received announcement: ${message}`);
});