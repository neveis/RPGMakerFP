const MoveState = cc.Enum({
    Stand: 0,
    Up: 8,
    Right: 6,
    Down: 2,
    Left: 4
});
const Direction = cc.Enum({
    None: 0,
    Up: 8,
    Right: 6,
    Down: 2,
    Left: 4,
    LeftDown: 1,
    RightDown: 3,
    LeftUp: 7,
    RightUp: 9
});
const EventType = cc.Enum({
    Dialogue: 1,
    Shop: 2,
    SwitchScene: 3,
    ScrollMap: 5,
    MoveActor: 6,
    ShowActor: 7,
    SetDone: 8,
    SetActorPos: 9,
    ShowActorBalloon: 10,
    ShowItemBox: 11,
    AddItem: 12,
    ShowMessage: 13,
});
const LayerOrder = cc.Enum({
    Below: 0,
    Same: 1,
    Above: 2,
});
var RangeType = cc.Enum({
    POINT: 1,
    SQUARE: 2,
    RHOMBUS: 3,
    LINE: 4,
    FRONTSQUARE: 5,
    FRONTRHOMBUS: 6,
    CROSS: 7,
    WALL: 8
});
const GridPerStep = 2;
const MoveStep = 32;
const MoveTime = 0.25;
const ActorOffset = 4;
const MapList = {
    "1": "InnFirstFloor",
    "2": "InnSecondFloor",
    "3": "ForestOne",
    "4": "ForestTwo",
    "5": "ForestThree",
    "6": "ForestFour",
    "7": "CampNight",
    "8": "CampDay",
    "99": "Ending"
};
//TileSetColumn是 门 所在的图集的列数
const MapPara = {
    "1": {
        BlockTileGid: 385
    },
    "2": {
        BlockTileGid: 385,
        TileSetColumn: 16
    },
    "3": {
        BlockTileGid: 521
    },
    "4": {
        BlockTileGid: 521
    },
    "5": {
        BlockTileGid: 521
    },
    "6": {
        BlockTileGid: 521
    },
    "7": {
        BlockTileGid: 521
    },
    "8": {
        BlockTileGid: 521
    },
};
const NodeMap = {
    "1": "TouchPanel",
    "2": "MainButton",
    "default": ["TouchPanel", "MainButton", "GroupList", "GameMenu"]
}
const AudioPath = 'resources/Audio/'
module.exports = {
    MoveState: MoveState,
    Direction: Direction,
    EventType: EventType,
    LayerOrder: LayerOrder,
    RangeType: RangeType,
    GridPerStep: GridPerStep,
    MoveStep: MoveStep,
    MoveTime: MoveTime,
    MapList: MapList,
    ActorOffset: ActorOffset,
    NodeMap: NodeMap,
    AudioPath: AudioPath,
    MapPara: MapPara
};