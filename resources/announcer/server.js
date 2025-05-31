RegisterCommand('announce', (source, args, rawCommand) => {
    const announcementMessage = args.join(' ');

    if (announcementMessage.length > 0) {
        TriggerClientEvent('announcer:showAnnouncement', -1, announcementMessage);

        console.log(`[Announcer - Server] Announcement made: ${announcementMessage} (by source: ${source})`);
    } else {
        console.log('[Announcer - Server] Usage: announce <your message here>');

        if (source !== 0) {
            TriggerClientEvent('chatMessage', source, '^1[Announcer]', [255, 0 ,0], 'Usage: /announce <message>')
        }
    }
}, false);