RegisterCommand('tp', (source, args, rawCommand) => {
        const playerPed = PlayerPedId();

        const x = -1037.7;
        const y = -2737.5;
        const z = 20.0;

        SetEntityCoords(playerPed, x, y, z, false, false, false, true);

        TriggerEvent('chatMessage', '^2[Teleport]', [255, 255, 255], 'Teleported to LSIA!');

        console.log('Player Teleported to LSIA.')
}, false);