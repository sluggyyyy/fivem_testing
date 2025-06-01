const inventories = new Map();
const nameAndSteam = new Map();

const initPlayerInventory = (playerIdentifier) => {
    if (!inventories.has(playerIdentifier)) {
        inventories.set(playerIdentifier, new Map());
        console.log(`[Inventory] Initialized inventory for ${playerIdentifier}`);
    } else {
        console.log(`[Inventory] Player ${playerIdentifier} already has an inventory`);
    }
};

const addItemToInventory = (playerIdentifier, itemName, quantityToAdd) => {
    initPlayerInventory(playerIdentifier);
    const playerInventory = inventories.get(playerIdentifier);
    const currentQuantity = playerInventory.has(itemName) ? playerInventory.get(itemName) : 0;
    const newQuantity = currentQuantity + quantityToAdd;

    playerInventory.set(itemName, newQuantity);

    console.log(`[Inventory] ${playerIdentifier}: Added ${quantityToAdd} ${itemName}`)
};

const removeItemFromInventory = (playerIdentifier, itemName, quantityToRemove) => {
    if (!inventories.has(playerIdentifier)) {
        console.log(`[Inventory] ${playerIdentifier}: No inventory`);
        return false;
    }

    const playerInventory = inventories.get(playerIdentifier);

    if (!playerInventory.has(itemName)) {
        console.log(`[Inventory] ${playerIdentifier}: Item not found`);
        return false;
    }

    const currentQuantity = playerInventory.get(itemName);

    if (currentQuantity < quantityToRemove) {
        console.log(`[Inventory] ${playerIdentifier} cannot drop item`);
        return false;
    }

    const newQuantity = currentQuantity - quantityToRemove;

    if (newQuantity <= 0) {
        playerInventory.delete(itemName);
    } else {
        playerInventory.set(itemName, newQuantity);
        console.log(`[Inventory] ${playerIdentifier}: Removed ${quantityToRemove} ${itemName}`)
    }

    return true;
};

const getPlayerInventory = (playerIdentifier) => {
    return inventories.get(playerIdentifier) || new Map();
};

const getItemQuantity = (playerIdentifier, itemName) => {
    const playerInventory = inventories.get(playerIdentifier);
    if (playerInventory && playerInventory.has(itemName)) {
        return playerInventory.get(itemName);
    }
    return 0;
};

const convertMapToObject = (map) => {
    const obj = {};
    for (let [key, value] of map) {
        obj[key] = value;
    }
    return obj;
};

const getPlayerIdentifiers = (source) => {
    const identifiers = [];

    for (let i = 0; i < GetNumPlayerIdentifiers(source); i++) {
        identifiers.push(GetPlayerIdentifier(source, i));
    }
    return identifiers;
};

on('playerConnecting', (playerName, setKickReason, deferrals) => {
    const playerSource = global.source;
    const playerIdentifiers = getPlayerIdentifiers(playerSource);

    const steamIdentifier = playerIdentifiers.find(id => id.startsWith('steam:'));

    if (steamIdentifier) {
        initPlayerInventory(steamIdentifier);
        nameAndSteam.set(playerName, steamIdentifier);
    } else {
        console.log(`[Inventory] Could not find Steam identifier for player ${playerName}`)
    }
});

on('playerDropped', () => {
    const playerSource = global.source;
    const playerIdentifiers = getPlayerIdentifiers(playerSource);
    const steamIdentifier = playerIdentifiers.find(id => id.startsWith('steam:'));

    if (steamIdentifier) {
        console.log(`[Inventory] Player ${steamIdentifier} disconnected.`);
        console.log(`${steamIdentifier}: ${inventories.get(steamIdentifier)}`);
    }
});

RegisterCommand('additem', (source, args, rawCommand) => {
    if (source === 0) {
        console.log('[Inventory] Usage: additem <player_steam_id> <item_name> <quantity>');
        return;
    }

    const playerIdentifiers = getPlayerIdentifiers(source);
    const playerSteamId = playerIdentifiers.find(id => id.startsWith('steam:'));

    if (!playerSteamId) {
        TriggerClientEvent('chatMessage', source, '^1[Inventory]', [255,0,0], 'Could not find Steam ID');
        return;
    }

    const itemName = args[0];
    const quantity = parseInt(args[1]);

    if (!itemName || isNaN(quantity) || quantity <= 0) {
        TriggerClientEvent('chatMessage', source, '^1[Inventory]', [255,0,0], 'Usage: /additem <item_name> <quantity>');
        return;
    }

    addItemToInventory(playerSteamId, itemName, quantity);
    TriggerClientEvent('chatMessage', source, '^2[Inventory]', [255, 255, 255], `Added ${quantity} ${itemName}`);

}, false);

RegisterCommand('removeitem', (source, args, rawCommand) => {
    if (source === 0) {
        console.log('[Inventory] Usage: removeitem <player_steam_id> <item_name> <quantity>');
        return;
    }

    const playerIdentifiers = getPlayerIdentifiers(source);
    const playerSteamId = playerIdentifiers.find(id => id.startsWith('steam:'));

    if (!playerSteamId) {
        TriggerClientEvent('chatMessage', source, '^1[Inventory]', [255, 0, 0], 'Could not find steam ID');
        return;
    }

    const itemName = args[0];
    const quantity = parseInt(args[1]);

    if (!itemName || isNaN(quantity) || quantity <= 0) {
        TriggerClientEvent('chatMessage', source, '^1[Inventory]', [255, 0, 0], 'Usage: /removeitem <item_name> <quantity>');
        return;
    } 
    
    const success = removeItemFromInventory(playerSteamId, itemName, quantity);
    
    if (success) {
        TriggerClientEvent('chatMessage', source, '^2[Inventory]', [255, 255, 255], `Removed ${quantity} ${itemName}`);
    } else {
        TriggerClientEvent('chatMessage', source, '^1[Inventory]', [255, 0, 0], `Failed to remove ${itemName}`);
    }

}, false);

RegisterCommand('showinv', (source, args, rawCommand) => {
    if (source === 0) {
        const targetIdentifier = args[0];
        if (!targetIdentifier) {
            console.log('[Inventory] Usage: showinv <player_id>');
            return;
        }
        const targetInventory = getPlayerInventory(targetIdentifier)
        if (targetInventory.size === 0) {
            console.log(`[Inventory] ${targetIdentifier} inventory empty or doesnt exist`);
        } else {
            console.log(`[Inventory] Inventory for ${targetIdentifier}:`);
            for (let [item, qty] of targetInventory) {
                console.log(` - ${item}: ${qty}`);
            }
        }
        return;
    }
    const playerIdentifiers = getPlayerIdentifiers(source);
    const playerSteamId = playerIdentifiers.find(id => id.startsWith('steam:'));

    if (!playerSteamId) {
        TriggerClientEvent('chatMessage', source, '^1[Inventory]', [255, 0, 0], 'No Steam ID');
        return;
    }

    const playerInventory = getPlayerInventory(playerSteamId);
    let message = 'Inventory:';

    if (playerInventory.size === 0) {
        message += ' (Empty)';
    } else {
        for (let [item, qty] of playerInventory) {
            message += ` - ${item}: ${qty}\n`;
        }
    }
    TriggerClientEvent('chatMessage', source, '^2[Inventory]', [255, 255, 255], message);
    console.log(`Inventory of ${playerSteamId}`);
}, false);

RegisterCommand('printsteam', (source, args, rawCommand) => {
    const players = getPlayers();
    for (const playerId of players) {
        const playerName = GetPlayerName(playerId);
        const playerIdentifiers = getPlayerIdentifiers(playerId);
        const steamIdentifier = playerIdentifiers.find(id => id.startsWith('steam:'));
        
        if (steamIdentifier && !nameAndSteam.has(playerName)) {
            nameAndSteam.set(playerName, steamIdentifier);
        }
    }
    
    if (nameAndSteam.size === 0) {
        console.log('[SteamID] No players with Steam IDs found');
        TriggerClientEvent('chatMessage', source, '^1[SteamID]', [255,255,255], 'No players with Steam IDs found');
        return;
    }
    
    for (const [key, value] of nameAndSteam) {
        console.log(`${key} - ${value}`);
        TriggerClientEvent('chatMessage', source, '^2[SteamID]', [255,255,255], `${key} - ${value}`);
    }
}, false);