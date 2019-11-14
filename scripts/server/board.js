/*
This is the script for the main game board.
*/

var board;
var boardHeight;
var boardWidth;

var gameObjects;

function Board(width, height) {
  boardWidth = width;   // Width in tiles
  boardHeight = height;   // Height in tiles

  // This is the main board collection used to store the locations of objects
  board = Generate(width, height);

  // Array containing all bombs, powerups etc
  gameObjects = new Array();



  function Generate(width, height) {
    // Create 2-dimensional array for the board
    var newBoard = new Array(width);
    for (let i = 0; i < height; i++) {
      newBoard[i] = new Array(height);
    }

    // Initialise elements
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Set every tile to be empty initially
        newBoard[x][y] = EmptyTile(x, y);

        // Set edge to be indestructable tiles
        if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
          newBoard[x][y] = IndestructibleTile(x, y);
        }
        else {
          if (x % 2 == 0 && y % 2 == 0) {
            newBoard[x][y] = IndestructibleTile(x, y);
          }
          else {
            var random = Math.floor(Math.random() * 10);

            if (random < 4) {
              newBoard[x][y] = DestructableTile(x, y);
            }
          }
        }

      }
    }

    return newBoard;
  }


  function EmptyTile(x, y) {
    let tile = Tile(x, y);
    tile.isDestructable = false;
    tile.isCollidable = false;
    tile.isEmpty = true;
    tile.isDamaging = false;
    tile.sprite = new Image(16, 16);
    tile.sprite.src = 'sprites/tileset/cropped/emptyTile.png';

    return tile;
  }

  /**
    Tile that cannot be destroyed.
  */
  function IndestructibleTile(x, y) {
    let tile = Tile(x, y);
    tile.isDestructable = false;
    tile.isCollidable = true;
    tile.isEmpty = false;
    tile.isDamaging = false;
    tile.sprite = new Image(16, 16);
    tile.sprite.src = 'sprites/tileset/cropped/indestructableTile.png';

    return tile;
  }

  /**
    Tile that can be destroyed.
  */
  function DestructableTile(x, y) {
    let tile = Tile(x, y);
    tile.isDestructable = true;
    tile.isCollidable = true;
    tile.isEmpty = false;
    tile.isDamaging = false;
    tile.sprite = new Image(16, 16);

    // Set sprite to be random 
    var random = Math.floor(Math.random() * 20);
    if (random < 8) {
      tile.sprite.src = 'sprites/tileset/cropped/destructableTile2.png';
    }
    else if (random < 15) {
      tile.sprite.src = 'sprites/tileset/cropped/destructableTile1.png';
    }
    else {
      tile.sprite.src = 'sprites/tileset/cropped/destructableTile4.png';
    }

    tile.destroy = function () {
      tile.isCollidable = false;
      tile.isEmpty = true;
      tile.sprite.src = 'sprites/tileset/cropped/destroyedTile.png';
    }

    return tile;
  }

  function Tile(xPosition, yPosition) {
    let tile = {
      x: xPosition,
      y: yPosition,
      isDestructable: undefined,
      isCollidable: undefined,
      isEmpty: undefined,
      isDamaging: undefined,
      sprite: undefined
    }

    return tile;
  }
}

// Function that calculates the x and y tile position of the coordinates given 
function getNearestTile(x, y) {
  return {
    x: Clamp(Math.floor(x / PIXELS_PER_TILE), 0, boardWidth),
    y: Clamp(Math.floor(y / PIXELS_PER_TILE), 0, boardHeight)
  };
}

// Function that calculates all of the possible tiles that the objects is on
function getAllConnectingTiles(x, y, width, height) {
  var tileMin = getNearestTile(x, y);
  var tileMax = getNearestTile(x + width, y + height);

  return [tileMin, tileMax];
}


// this should be in the player object
function dropBomb(player) {
  if (player.activeBombs < player.currentMaxBombs) {
    // Centre of bomb should be centre of player
    var trueX = getPlayerX() + player.size / 2 - BOMB_SIZE / 2;
    var trueY = getPlayerY() + player.size / 2 - BOMB_SIZE / 2;

    var bomb = Bomb(trueX, trueY, BOMB_DEFAULT_TIMER, player);

    player.activeBombs++;

    gameObjects.push(bomb);
  }
}


function bombExplode(bomb) {
  // Gets the tile on the centre of the bomb sprite 
  var tile = getNearestTile(bomb.x + BOMB_SIZE / 2, bomb.y + BOMB_SIZE / 2);

  // Explode tile
  if (board[tile.x][tile.y].isDestructable) {
    board[tile.x][tile.y].destroy();
  }

  let power = bomb.power;
  
  for (var i = DEFAULT_BOMB_POWER; i <= power; i++) {
    // Nearby tiles
    let left = Tile(Clamp(tile.x - i, 0, boardWidth), tile.y);
    if (board[left.x][left.y].isDestructable) {
      board[left.x][left.y].destroy();
    }

    let right = Tile(Clamp(tile.x + i, 0, boardWidth), tile.y);
    if (board[right.x][right.y].isDestructable) {
      board[right.x][right.y].destroy();
    }

    let up = Tile(tile.x, Clamp(tile.y - i, 0, boardHeight));
    if (board[up.x][up.y].isDestructable) {
      board[up.x][up.y].destroy();
    }

    let down = Tile(tile.x, Clamp(tile.y + i, 0, boardHeight));
    if (board[down.x][down.y].isDestructable) {
      board[down.x][down.y].destroy();
    }
  }


  //bomb.owner.activeBombs--;
  player.activeBombs--;

  for (var i = 0; i < gameObjects.length; i++) {
    if (gameObjects[i] === bomb) {
      // Remove the bomb from game objects
      gameObjects.splice(i, 1);
    }
  }

}




function isValidMove(oldX, oldY, playerSize, newX, newY) {
  // Get the 3x3 array of tiles around the player
  var xTileMin = Math.floor(Clamp(getPlayerX() / PIXELS_PER_TILE, 0, boardWidth));
  var yTileMin = Math.floor(Clamp(getPlayerY() / PIXELS_PER_TILE, 0, boardHeight));
  var xTileMax = Math.floor(Clamp((getPlayerX() + playerSize) / PIXELS_PER_TILE + 1, 0, boardWidth));
  var yTileMax = Math.floor(Clamp((getPlayerY() + playerSize) / PIXELS_PER_TILE + 1, 0, boardHeight));

  // Loop through the nearby tiles
  for (var tileY = yTileMin; tileY < yTileMax; tileY++) {
    for (var tileX = xTileMin; tileX < xTileMax; tileX++) {
      // Check tile is collidable
      if (board[tileX][tileY].isCollidable) {
        // Check player actually collides with either the new x or y pos
        if (Intersects(newX, oldY, playerSize, playerSize, tileX * PIXELS_PER_TILE, tileY * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE)) {
          return false;
        }
        if (Intersects(oldX, newY, playerSize, playerSize, tileX * PIXELS_PER_TILE, tileY * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE)) {
          return false;
        }
      }
    }
  }
  return true;
}


function destroyAllTiles() {
  for (var y = 0; y < boardHeight; y++) {
    for (var x = 0; x < boardWidth; x++) {
      if (board[x][y].isDestructable) {
        board[x][y].destroy();
      }
    }
  }
}




function UpdateBoard() {
  // Update all gameObjects 
  for (var i = 0; i < gameObjects.length; i++) {
    gameObjects[i].update();
  }

  //console.log("Board updated.");
}