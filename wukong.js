/************************************************\
 ================================================
 
                      WUKONG
              javascript chess engine
           
                        by
                        
                 Code Monkey King
 
 ===============================================
\************************************************/

// chess engine object
var Engine = function(boardSize, lightSquare, darkSquare, selectColor) {

  /****************************\
   ============================
   
         GLOBAL CONSTANTS

   ============================              
  \****************************/
  
  // chess engine version
  const version = '1.3a';
  const elo = '1700';

  // sides to move  
  const white = 0;
  const black = 1;
  
  // piece encoding  
  const P = 1, N = 2, B = 3, R = 4, Q = 5, K = 6;
  const p = 7, n = 8, b = 9, r = 10, q = 11, k = 12;
  
  // empty square & offboard square
  const e = 0, o = 13;
  
  // square encoding
  const a8 = 0,    b8 = 1,    c8 = 2,   d8 = 3,   e8 = 4,   f8 = 5,   g8 = 6,   h8 = 7;
  const a7 = 16,   b7 = 17,   c7 = 18,  d7 = 19,  e7 = 20,  f7 = 21,  g7 = 22,  h7 = 23;
  const a6 = 32,   b6 = 33,   c6 = 34,  d6 = 35,  e6 = 36,  f6 = 37,  g6 = 39,  h6 = 40;
  const a5 = 48,   b5 = 49,   c5 = 50,  d5 = 51,  e5 = 52,  f5 = 53,  g5 = 54,  h5 = 55;
  const a4 = 64,   b4 = 65,   c4 = 66,  d4 = 67,  e4 = 68,  f4 = 69,  g4 = 70,  h4 = 71;
  const a3 = 80,   b3 = 81,   c3 = 82,  d3 = 83,  e3 = 84,  f3 = 85,  g3 = 86,  h3 = 87;
  const a2 = 96,   b2 = 97,   c2 = 98,  d2 = 99,  e2 = 100, f2 = 101, g2 = 102, h2 = 103;
  const a1 = 112,  b1 = 113,  c1 = 114, d1 = 115, e1 = 116, f1 = 117, g1 = 118, h1 = 119;
  
  // offboard empassant square
  const noEnpassant = 120;
  
  // array to convert board square indices to coordinates
  const coordinates = [
    'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', 'i8', 'j8', 'k8', 'l8', 'm8', 'n8', 'o8', 'p8',
    'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', 'i7', 'j7', 'k7', 'l7', 'm7', 'n7', 'o7', 'p7',
    'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', 'i6', 'j6', 'k6', 'l6', 'm6', 'n6', 'o6', 'p6',
    'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', 'i5', 'j5', 'k5', 'l5', 'm5', 'n5', 'o5', 'p5',
    'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', 'i4', 'j4', 'k4', 'l4', 'm4', 'n4', 'o4', 'p4',
    'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', 'i3', 'j3', 'k3', 'l3', 'm3', 'n3', 'o3', 'p3',
    'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', 'i2', 'j2', 'k2', 'l2', 'm2', 'n2', 'o2', 'p2',
    'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', 'i1', 'j1', 'k1', 'l1', 'm1', 'n1', 'o1', 'p1'
  ];


  /****************************\
   ============================
   
         BOARD DEFINITIONS

   ============================              
  \****************************/
  
  // starting position
  const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 ';
  
  // 0x88 chess board representation
  var board = [
    r, n, b, q, k, b, n, r,  o, o, o, o, o, o, o, o,
    p, p, p, p, p, p, p, p,  o, o, o, o, o, o, o, o,
    e, e, e, e, e, e, e, e,  o, o, o, o, o, o, o, o,
    e, e, e, e, e, e, e, e,  o, o, o, o, o, o, o, o,
    e, e, e, e, e, e, e, e,  o, o, o, o, o, o, o, o,
    e, e, e, e, e, e, e, e,  o, o, o, o, o, o, o, o,
    P, P, P, P, P, P, P, P,  o, o, o, o, o, o, o, o,
    R, N, B, Q, K, B, N, R,  o, o, o, o, o, o, o, o
  ];
  
  // chess board state variables
  var side = white;
  var enpassant = noEnpassant;
  var castle = 15;
  var fifty = 0;
  var hashKey = 0;
  var kingSquare = [e1, e8];
  
  // piece list
  var pieceList = {
    // piece counts
    [P]: 0, [N]: 0, [B]: 0, [R]: 0, [Q]: 0, [K]: 0,
    [p]: 0, [n]: 0, [b]: 0, [r]: 0, [q]: 0, [k]: 0,
    
    // list of pieces with associated squares
    pieces: new Array(13 * 10)
  };
  
  // board move stack
  var moveStack = [];
  
  // plies
  var searchPly = 0;
  var gamePly = 0;
  

  /****************************\
   ============================
   
      RANDOM NUMBER GENERATOR

   ============================              
  \****************************/
  
  // fixed random seed
  var randomState = 1804289383;

  // generate 32-bit pseudo legal numbers
  function random() {
    var number = randomState;
    
    // 32-bit XOR shift
    number ^= number << 13;
    number ^= number >> 17;
    number ^= number << 5;
    randomState = number;

    return number;
  }


  /****************************\
   ============================
   
           ZOBRIST KEYS

   ============================              
  \****************************/ 
 
  // random keys
  var pieceKeys = new Array(13 * 128);
  var castleKeys = new Array(16);
  var sideKey;
  
  // init random hash keys
  function initRandomKeys() {
    for (var index = 0; index < 13 * 128; index++) pieceKeys[index] = random();
    for (var index = 0; index < 16; index++) castleKeys[index] = random();
    sideKey = random();
  }
  
  // generate hash key
  function generateHashKey() {
    var finalKey = 0;
    
    // hash board position
    for (var square = 0; square < 128; square++) {
      if ((square & 0x88) == 0)	{
        var piece = board[square];
        if (piece != e) finalKey ^= pieceKeys[(piece * 128) + square];
      }		
    }
    
    // hash board state variables
    if (side == white) finalKey ^= sideKey;
    if (enpassant != noEnpassant) finalKey ^= pieceKeys[enpassant];
    finalKey ^= castleKeys[castle];
    
    return finalKey;
  }


  /****************************\
   ============================
   
           BOARD METHODS

   ============================              
  \****************************/
  
  // reset board
  function resetBoard() {
    // reset board position
    for (var rank = 0; rank < 8; rank++) {
      for (var file = 0; file < 16; file++) {
        var square = rank * 16 + file;
        if ((square & 0x88) == 0) board[square] = e;
      }
    }
    
    // reset board state variables
    side = -1;
    enpassant = noEnpassant;
    castle = 0;
    fifty = 0;
    hashKey = 0;
    kingSquare = [0, 0];
    moveStack = [];
    
    // reset plies
    searchPly = 0;
    gamePly = 0;
    
    // reset repetition table
    for (let index in repetitionTable) repetitionTable[index] = 0;
  }
  
  // init piece list
  function initPieceList() {
    // reset piece counts
    for (var piece = P; piece <= k; piece++)
      pieceList[piece] = 0;
    
    // reset piece list
    for (var index = 0; index < pieceList.pieces.length; index++)
      pieceList.pieces[index] = 0;
    
    // associate pieces with squares and count material
    for (var square = 0; square < 128; square++) {
      if ((square & 0x88) == 0) {
        var piece = board[square];
        
        if (piece) {
          pieceList.pieces[piece * 10 + pieceList[piece]] = square;
          pieceList[piece]++;
        }
      }
    }
  }
  
  // validate move
  function moveFromString(moveString) {
    let moveList = [];
    generateMoves(moveList);

    // parse move string
    var sourceSquare = (moveString[0].charCodeAt() - 'a'.charCodeAt()) +(8 - (moveString[1].charCodeAt() - '0'.charCodeAt())) * 16;
    var targetSquare = (moveString[2].charCodeAt() - 'a'.charCodeAt()) + (8 - (moveString[3].charCodeAt() - '0'.charCodeAt())) * 16;

    // validate
    for(var count = 0; count < moveList.length; count++) {
      var move = moveList[count].move;
      var promotedPiece = 0;

      if(getMoveSource(move) == sourceSquare && getMoveTarget(move) == targetSquare) {
        promotedPiece = getMovePromoted(move);

        if(promotedPiece) {
          if((promotedPiece == N || promotedPiece == n) && moveString[4] == 'n') return move;
          else if((promotedPiece == B || promotedPiece == b) && moveString[4] == 'b') return move;
          else if((promotedPiece == R || promotedPiece == r) && moveString[4] == 'r') return move;
          else if((promotedPiece == Q || promotedPiece == q) && moveString[4] == 'q') return move;
          continue;
        }

        // legal move
        return move;
      }
    }

    // illegal move
    return 0;
  }

  
  /****************************\
   ============================
   
             ATTACKS

   ============================              
  \****************************/

  // square attacked
  function isSquareAttacked(square, side) {
    // by pawns
    for (let index = 0; index < 2; index++) {
      let targetSquare = square + pawnDirections.offsets[side][index] 
      if (((targetSquare) & 0x88) == 0 &&
           (board[targetSquare] == pawnDirections.pawn[side])) return 1;
    }
    
    // by leaper pieces
    for (let piece in leaperPieces) {      
      for (let index = 0; index < 8; index++) {
        let targetSquare = square + leaperPieces[piece].offsets[index];
        let targetPiece = board[targetSquare];
        if ((targetSquare & 0x88) == 0)
          if (targetPiece == leaperPieces[piece].side[side]) return 1;
      }
    }
    
    // by slider pieces
    for (let piece in sliderPieces) {
      for (let index = 0; index < 4; index++) {
        let targetSquare = square + sliderPieces[piece].offsets[index];
        while ((targetSquare & 0x88) == 0) {
          var targetPiece = board[targetSquare];
          if (sliderPieces[piece].side[side].includes(targetPiece)) return 1;
          if (targetPiece) break;
          targetSquare += sliderPieces[piece].offsets[index];
        }
      }
    }

    return 0;
  }


  /****************************\
   ============================
   
          MOVE ENCODING
 
   ============================              
  \****************************/
  
  // encode move
  function encodeMove(source, target, piece, capture, pawn, enpassant, castling) {
    return (source) |
           (target << 7) |
           (piece << 14) |
           (capture << 18) |
           (pawn << 19) |
           (enpassant << 20) |
           (castling << 21)
  }

  // decode move
  function getMoveSource(move) { return move & 0x7f }
  function getMoveTarget(move) { return (move >> 7) & 0x7f }
  function getMovePromoted(move) { return (move >> 14) & 0xf }
  function getMoveCapture(move) { return (move >> 18) & 0x1 }
  function getMovePawn(move) { return (move >> 19) & 0x1 }
  function getMoveEnpassant(move) { return (move >> 20) & 0x1 }
  function getMoveCastling(move) { return (move >> 21) & 0x1 }
  
  
  /****************************\
   ============================
   
          MOVE GENERATOR
 
   ============================              
  \****************************/
  
  // piece move offsets
  var knightOffsets = [33, 31, 18, 14, -33, -31, -18, -14];
  var bishopOffsets = [15, 17, -15, -17];
  var rookOffsets = [16, -16, 1, -1];
  var kingOffsets = [16, -16, 1, -1, 15, 17, -15, -17];
  
  // pawn directions to side mapping
  var pawnDirections = {
    offsets: [[17, 15], [-17, -15]],
    pawn: [P, p]
  }
  
  // leaper piece to offset mapping
  var leaperPieces = {
    knight: { offsets: knightOffsets, side: [N, n] },
    king: { offsets: kingOffsets, side: [K, k] }
  };
  
  // slider piece to offset mapping
  var sliderPieces = {
    bishop: { offsets: bishopOffsets, side: [[B, Q], [b, q]] },
    rook: { offsets: rookOffsets, side: [[R, Q], [r, q]] }
  };
  
  // pawn & castling mappings
  var specialMoves = {
    color: [
      {
        offset: [-17, -15],
        pawn: P,
        target: -16,
        doubleTarget: -32,
        capture: [7, 12],
        rank7: [a7, h7],
        rank2: [a2, h2],
        promoted: [Q, R, B, N],
        king: K,
        castling: [1, 2],
        empty: [f1, g1, d1, b1, c1],
        attacked: [e1, f1, d1],
        by: [black, white],
        castle: [e1, g1, c1]
      },
      {
        offset: [17, 15],
        pawn: p,
        target: 16,
        doubleTarget: 32,
        capture: [1, 6],
        rank7: [a2, h2],
        rank2: [a7, h7],
        promoted: [q, r, b, n],
        king: k,
        castling: [4, 8],
        empty: [f8, g8, d8, b8, c8],
        attacked: [e8, f8, d8],
        by: [black, white],
        castle: [e8, g8, c8]
      }
    ]
  }
  
  // castling rights
  var castlingRights = [
     7, 15, 15, 15,  3, 15, 15, 11,  o, o, o, o, o, o, o, o,
    15, 15, 15, 15, 15, 15, 15, 15,  o, o, o, o, o, o, o, o,
    15, 15, 15, 15, 15, 15, 15, 15,  o, o, o, o, o, o, o, o,
    15, 15, 15, 15, 15, 15, 15, 15,  o, o, o, o, o, o, o, o,
    15, 15, 15, 15, 15, 15, 15, 15,  o, o, o, o, o, o, o, o,
    15, 15, 15, 15, 15, 15, 15, 15,  o, o, o, o, o, o, o, o,
    15, 15, 15, 15, 15, 15, 15, 15,  o, o, o, o, o, o, o, o,
    13, 15, 15, 15, 12, 15, 15, 14,  o, o, o, o, o, o, o, o
  ];

  // populate move list
  function addMove(moveList, move) {
    let moveScore = 0;
    
    if (getMoveCapture(move)) {
      moveScore = mvvLva[board[getMoveSource(move)] * 13 + board[getMoveTarget(move)]];
      moveScore += 10000;
    } else {
      if (killerMoves[searchPly] == move) moveScore = 9000;
      else if (killerMoves[maxPly + searchPly] == move) moveScore = 8000;
      else moveScore = historyMoves[board[getMoveSource(move)] * 128 + getMoveTarget(move)];
    }

    moveList.push({
      move: move,
      score: moveScore
    });
  }

  // generate moves
  function generateMoves(moveList) {
    for (let piece = P; piece <= k; piece++) {
      for (let pieceIndex = 0; pieceIndex < pieceList[piece]; pieceIndex++) {
        let sourceSquare = pieceList.pieces[piece * 10 + pieceIndex];
        
        // pawns
        if (board[sourceSquare] == specialMoves.color[side].pawn) {
          let targetSquare = sourceSquare + specialMoves.color[side].target;
          
          // quiet moves
          if ((targetSquare & 0x88) == 0 && board[targetSquare] == e) {   
            if (sourceSquare >= specialMoves.color[side].rank7[0] &&
                sourceSquare <= specialMoves.color[side].rank7[1]) {
              for (let promotedIndex = 0; promotedIndex < 4; promotedIndex++) {
                let promotedPiece = specialMoves.color[side].promoted[promotedIndex];
                addMove(moveList, encodeMove(sourceSquare, targetSquare, promotedPiece, 0, 0, 0, 0));
              }
            } else {
              addMove(moveList, encodeMove(sourceSquare, targetSquare, 0, 0, 0, 0, 0));
              let doubleTarget = sourceSquare + specialMoves.color[side].doubleTarget;
              
              if ((sourceSquare >= specialMoves.color[side].rank2[0] &&
                   sourceSquare <= specialMoves.color[side].rank2[1]) &&
                   board[doubleTarget] == e)
                addMove(moveList, encodeMove(sourceSquare, doubleTarget, 0, 0, 1, 0, 0));
            }
          }
          
          // captures
          for (let index = 0; index < 2; index++) {
            let pawn_offset = specialMoves.color[side].offset[index];
            let targetSquare = sourceSquare + pawn_offset;
            
            if ((targetSquare & 0x88) == 0) {
              if ((sourceSquare >= specialMoves.color[side].rank7[0] &&
                   sourceSquare <= specialMoves.color[side].rank7[1]) &&
                  (board[targetSquare] >= specialMoves.color[side].capture[0] &&
                   board[targetSquare] <= specialMoves.color[side].capture[1])
                 ) {
                for (let promotedIndex = 0; promotedIndex < 4; promotedIndex++) {
                  let promotedPiece = specialMoves.color[side].promoted[promotedIndex];
                  addMove(moveList, encodeMove(sourceSquare, targetSquare, promotedPiece, 1, 0, 0, 0));
                }
              } else {
                if (board[targetSquare] >= specialMoves.color[side].capture[0] &&
                    board[targetSquare] <= specialMoves.color[side].capture[1])
                  addMove(moveList, encodeMove(sourceSquare, targetSquare, 0, 1, 0, 0, 0));
                if (targetSquare == enpassant)
                  addMove(moveList, encodeMove(sourceSquare, targetSquare, 0, 1, 0, 1, 0));
              }
            }
          }
        }

        // castling
        else if (board[sourceSquare] == specialMoves.color[side].king) {
          // king side
          if (castle & specialMoves.color[side].castling[0]) {
            if (board[specialMoves.color[side].empty[0]] == e &&
                board[specialMoves.color[side].empty[1]] == e) {
              if (isSquareAttacked(specialMoves.color[side].attacked[1], specialMoves.color[side].by[side]) == 0 &&
                  isSquareAttacked(specialMoves.color[side].attacked[0], specialMoves.color[side].by[side]) == 0)
                  addMove(moveList, encodeMove(specialMoves.color[side].castle[0], specialMoves.color[side].castle[1], 0, 0, 0, 0, 1));
            }
          }
          
          // queen side
          if (castle & specialMoves.color[side].castling[1]) {
            if (board[specialMoves.color[side].empty[2]] == e &&
                board[specialMoves.color[side].empty[3]] == e &&
                board[specialMoves.color[side].empty[4]] == e) {
              if (isSquareAttacked(specialMoves.color[side].attacked[2], specialMoves.color[side].by[side]) == 0 &&
                  isSquareAttacked(specialMoves.color[side].attacked[0], specialMoves.color[side].by[side]) == 0)
                  addMove(moveList, encodeMove(specialMoves.color[side].castle[0], specialMoves.color[side].castle[2], 0, 0, 0, 0, 1));
            }
          }
        }
        
        // leaper pieces
        for (let piece in leaperPieces) {
          if (board[sourceSquare] == leaperPieces[piece].side[side]) {
            for (let index = 0; index < 8; index++) {
              let targetSquare = sourceSquare + leaperPieces[piece].offsets[index];
              let capturedPiece = board[targetSquare];
              
              if ((targetSquare & 0x88) == 0) {
                if ((side == white) ? 
                    (capturedPiece == e || (capturedPiece >= 7 && capturedPiece <= 12)) : 
                    (capturedPiece == e || (capturedPiece >= 1 && capturedPiece <= 6))
                   ) {
                  if (capturedPiece) addMove(moveList, encodeMove(sourceSquare, targetSquare, 0, 1, 0, 0, 0));
                  else addMove(moveList, encodeMove(sourceSquare, targetSquare, 0, 0, 0, 0, 0));
                }
              }
            }
          }
        }
        
        // slider pieces
        for (let piece in sliderPieces) {
          if (board[sourceSquare] == sliderPieces[piece].side[side][0] ||
              board[sourceSquare] == sliderPieces[piece].side[side][1]) {
            for (var index = 0; index < 4; index++) {
              let targetSquare = sourceSquare + sliderPieces[piece].offsets[index];
              while (!(targetSquare & 0x88)) {
                var capturedPiece = board[targetSquare];
                
                if ((side == white) ? (capturedPiece >= 1 && capturedPiece <= 6) : ((capturedPiece >= 7 && capturedPiece <= 12))) break;
                if ((side == white) ? (capturedPiece >= 7 && capturedPiece <= 12) : ((capturedPiece >= 1 && capturedPiece <= 6))) {
                  addMove(moveList, encodeMove(sourceSquare, targetSquare, 0, 1, 0, 0, 0));
                  break;
                }
                
                if (capturedPiece == e) addMove(moveList, encodeMove(sourceSquare, targetSquare, 0, 0, 0, 0, 0));
                targetSquare += sliderPieces[piece].offsets[index];
              }
            }
          }
        }
      }
    }
  }
  
  // generate captures
  function generateCaptures(moveList) {
    for (let piece = P; piece <= k; piece++) {
      for (let pieceIndex = 0; pieceIndex < pieceList[piece]; pieceIndex++) {
        let sourceSquare = pieceList.pieces[piece * 10 + pieceIndex];
        
        // pawns
        if (board[sourceSquare] == specialMoves.color[side].pawn) {
          let targetSquare = sourceSquare + specialMoves.color[side].target;
          for (let index = 0; index < 2; index++) {
            let pawn_offset = specialMoves.color[side].offset[index];
            let targetSquare = sourceSquare + pawn_offset;
            
            if ((targetSquare & 0x88) == 0) {
              if ((sourceSquare >= specialMoves.color[side].rank7[0] &&
                   sourceSquare <= specialMoves.color[side].rank7[1]) &&
                  (board[targetSquare] >= specialMoves.color[side].capture[0] &&
                   board[targetSquare] <= specialMoves.color[side].capture[1])
                 ) {
                for (let promotedIndex = 0; promotedIndex < 4; promotedIndex++) {
                  let promotedPiece = specialMoves.color[side].promoted[promotedIndex];
                  addMove(moveList, encodeMove(sourceSquare, targetSquare, promotedPiece, 1, 0, 0, 0));
                }
              } else {
                if (board[targetSquare] >= specialMoves.color[side].capture[0] &&
                    board[targetSquare] <= specialMoves.color[side].capture[1])
                  addMove(moveList, encodeMove(sourceSquare, targetSquare, 0, 1, 0, 0, 0));
                if (targetSquare == enpassant)
                  addMove(moveList, encodeMove(sourceSquare, targetSquare, 0, 1, 0, 1, 0));
              }
            }
          }
        }
        
        // leaper pieces
        for (let piece in leaperPieces) {
          if (board[sourceSquare] == leaperPieces[piece].side[side]) {
            for (let index = 0; index < 8; index++) {
              let targetSquare = sourceSquare + leaperPieces[piece].offsets[index];
              let capturedPiece = board[targetSquare];
              
              if ((targetSquare & 0x88) == 0) {
                if ((side == white) ? 
                    (capturedPiece == e || (capturedPiece >= 7 && capturedPiece <= 12)) : 
                    (capturedPiece == e || (capturedPiece >= 1 && capturedPiece <= 6))
                   ) {
                  if (capturedPiece) addMove(moveList, encodeMove(sourceSquare, targetSquare, 0, 1, 0, 0, 0));
                }
              }
            }
          }
        }
        
        // slider pieces
        for (let piece in sliderPieces) {
          if (board[sourceSquare] == sliderPieces[piece].side[side][0] ||
              board[sourceSquare] == sliderPieces[piece].side[side][1]) {
            for (var index = 0; index < 4; index++) {
              let targetSquare = sourceSquare + sliderPieces[piece].offsets[index];
              while (!(targetSquare & 0x88)) {
                var capturedPiece = board[targetSquare];
                
                if ((side == white) ? (capturedPiece >= 1 && capturedPiece <= 6) : ((capturedPiece >= 7 && capturedPiece <= 12))) break;
                if ((side == white) ? (capturedPiece >= 7 && capturedPiece <= 12) : ((capturedPiece >= 1 && capturedPiece <= 6))) {
                  addMove(moveList, encodeMove(sourceSquare, targetSquare, 0, 1, 0, 0, 0));
                  break;
                }

                targetSquare += sliderPieces[piece].offsets[index];
              }
            }
          }
        }
      }
    }
  }
  
  // generate only legal moves
  function generateLegalMoves() {
    let legalMoves = [];
    let moveList = [];
    
    clearSearch();
    generateMoves(moveList);

    for (let count = 0; count < moveList.length; count++) {
      if (makeMove(moveList[count].move) == 0) continue;
      legalMoves.push(moveList[count]);
      takeBack();
    }
    
    return legalMoves;
  }

  // move piece on board
  function moveCurrentPiece(piece, sourceSquare, targetSquare) {
    board[targetSquare] = board[sourceSquare];
    board[sourceSquare] = e;
    hashKey ^= pieceKeys[piece * 128 + sourceSquare];
    hashKey ^= pieceKeys[piece * 128 + targetSquare];
    
    for (let pieceIndex = 0; pieceIndex < pieceList[piece]; pieceIndex++) {
      if (pieceList.pieces[piece * 10 + pieceIndex] == sourceSquare) {
        pieceList.pieces[piece * 10 + pieceIndex] = targetSquare;
        break;
      }
    }
  }
  
  // remove piece from board
  function removePiece(piece, square) {
    for (let pieceIndex = 0; pieceIndex < pieceList[piece]; pieceIndex++) {
      if (pieceList.pieces[piece * 10 + pieceIndex] == square) {
        var capturedIndex = pieceIndex;
        break;
      }
    }
    
    pieceList[piece]--;
    pieceList.pieces[piece * 10 + capturedIndex] = pieceList.pieces[piece * 10 + pieceList[piece]];    
  }
  
  // add piece to board
  function addPiece(piece, square) {
    board[square] = piece;
    hashKey ^= pieceKeys[piece * 128 + square];
    pieceList.pieces[piece * 10 + pieceList[piece]] = square;    
    pieceList[piece]++;
  }

  // make move
  function makeMove(move) {
    // update plies
    searchPly++;
    gamePly++;
    
    // update repetition table
    repetitionTable[gamePly] = hashKey;
    
    // parse move
    let sourceSquare = getMoveSource(move);
    let targetSquare = getMoveTarget(move);
    let promotedPiece = getMovePromoted(move);
    let capturedPiece = board[targetSquare];
    
    // moveStack board state variables
    moveStack.push({
      move: move,
      capturedPiece: 0,
      side: side,
      enpassant: enpassant,
      castle: castle,
      fifty: fifty,
      hash: hashKey,
    });
    
    // move piece
    moveCurrentPiece(board[sourceSquare], sourceSquare, targetSquare);
    
    // update 50 move rule
    fifty++;

    // handle capture
    if (getMoveCapture(move)) {
      if (capturedPiece) {
        moveStack[moveStack.length - 1].capturedPiece = capturedPiece;
        hashKey ^= pieceKeys[capturedPiece * 128 + targetSquare];
        removePiece(capturedPiece, targetSquare); 
      }
      fifty = 0;
    } else if (board[targetSquare] == P || board[targetSquare] == p)
      fifty = 0;
    
    // update enpassant square
    if (enpassant != noEnpassant) hashKey ^= pieceKeys[enpassant];
    enpassant = noEnpassant;
    
    // handle special moves
    if (getMovePawn(move)) {
      if (side == white) {
        enpassant = targetSquare + 16;
        hashKey ^= pieceKeys[targetSquare + 16];
      } else {
        enpassant = targetSquare - 16;
        hashKey ^= pieceKeys[targetSquare - 16];
      }
    } else if (getMoveEnpassant(move)) {
      if (side == white) {
        board[targetSquare + 16] = e;
        hashKey ^= pieceKeys[p * 128 + targetSquare + 16];
        removePiece(p, targetSquare + 16);
      } else {
        board[targetSquare - 16] = e;
        hashKey ^= pieceKeys[(P * 128) + (targetSquare - 16)];
        removePiece(P, targetSquare - 16);
      }
    } else if (getMoveCastling(move)) {
      switch(targetSquare) {
        case g1: moveCurrentPiece(R, h1, f1); break;
        case c1: moveCurrentPiece(R, a1, d1); break;
        case g8: moveCurrentPiece(r, h8, f8); break;
        case c8: moveCurrentPiece(r, a8, d8); break;
      }
    }
    
    // handle promotions
    if (promotedPiece) {
      if (side == white) {
        hashKey ^= pieceKeys[P * 128 + targetSquare];
        removePiece(P, targetSquare);
      } else {
        hashKey ^= pieceKeys[p * 128 + targetSquare];
        removePiece(p, targetSquare);
      }

      addPiece(promotedPiece, targetSquare);      
    }
    
    // update king square
    if (board[targetSquare] == K || board[targetSquare] == k) kingSquare[side] = targetSquare;
    
    // update castling rights
    hashKey ^= castleKeys[castle];
    castle &= castlingRights[sourceSquare];
    castle &= castlingRights[targetSquare];
    hashKey ^= castleKeys[castle];
    
    // switch side to move
    side ^= 1;
    hashKey ^= sideKey;
    
    // return illegal move if king is left in check 
    if (isSquareAttacked((side == white) ? kingSquare[side ^ 1] : kingSquare[side ^ 1], side)) {
      takeBack();
      return 0;
    } else return 1;
  }
  
  // take move back
  function takeBack() {
    // update plies
    searchPly--;
    gamePly--;
    
    // parse move
    let moveIndex = moveStack.length - 1;
    let move = moveStack[moveIndex].move;    
    let sourceSquare = getMoveSource(move);
    let targetSquare = getMoveTarget(move);
    
    // move piece
    moveCurrentPiece(board[targetSquare], targetSquare, sourceSquare);
    
    // restore captured piece
    if (getMoveCapture(move)) {
      //board[targetSquare] = moveStack[moveIndex].capturedPiece;
      addPiece(moveStack[moveIndex].capturedPiece, targetSquare);
    }
    
    // handle special moves
    if (getMoveEnpassant(move)) {
      if (side == white) addPiece(P, targetSquare - 16);
      else addPiece(p, targetSquare + 16);
    } else if (getMoveCastling(move)) {
      switch(targetSquare) {
        case g1: moveCurrentPiece(R, f1, h1); break;
        case c1: moveCurrentPiece(R, d1, a1); break;
        case g8: moveCurrentPiece(r, f8, h8); break;
        case c8: moveCurrentPiece(r, d8, a8); break;
      }
    } else if (getMovePromoted(move)) {
      (side == white) ? addPiece(p, sourceSquare): addPiece(P, sourceSquare);
      removePiece(getMovePromoted(move), sourceSquare);
    }

    // update king square
    if (board[sourceSquare] == K || board[sourceSquare] == k) kingSquare[side ^ 1] = sourceSquare;
    
    // switch side to move
    side = moveStack[moveIndex].side;
    
    // restore board state variables
    enpassant = moveStack[moveIndex].enpassant;
    castle = moveStack[moveIndex].castle;
    hashKey = moveStack[moveIndex].hash;
    fifty = moveStack[moveIndex].fifty;

    moveStack.pop();
  }
  
  // make null move
  function makeNullMove() {
    // backup current board state
    moveStack.push({
      move: 0,
      capturedPiece: 0,
      side: side,
      enpassant: enpassant,
      castle: castle,
      fifty: fifty,
      hash: hashKey,
    });
    
    if (enpassant != noEnpassant) hashKey ^= pieceKeys[enpassant];
    enpassant = noEnpassant;
    fifty = 0;
    side ^= 1;
    hashKey ^= sideKey;
  }
  
  // take null move
  function takeNullMove() {
    // restore board state
    side = moveStack[moveStack.length - 1].side;
    enpassant = moveStack[moveStack.length - 1].enpassant;
    castle = moveStack[moveStack.length - 1].castle;
    fifty = moveStack[moveStack.length - 1].fifty;
    hashKey = moveStack[moveStack.length - 1].hashKey;
    moveStack.pop();
  }


  /****************************\
   ============================
   
              PERFT

   ============================              
  \****************************/

  // visited nodes count
  var nodes = 0;
  
  // perft driver
  function perftDriver(depth) {
    if  (depth == 0) { nodes++; return; }
    
    let moveList = [];
    generateMoves(moveList);
    
    for (var count = 0; count < moveList.length; count++) {      
      if (!makeMove(moveList[count].move)) continue;
      perftDriver(depth - 1);
      takeBack();
    }
  }

  // perft test
  function perftTest(depth) {
    nodes = 0;
    console.log('   Performance test:\n');
    resultString = '';
    let startTime = Date.now();
    
    let moveList = [];
    generateMoves(moveList);
    
    for (var count = 0; count < moveList.length; count++) {      
      if (!makeMove(moveList[count].move)) continue;
      let cumNodes = nodes;
      perftDriver(depth - 1);
      takeBack();
      let oldNodes = nodes - cumNodes;
      console.log(  '   move' +
                    ' ' + (count + 1) + ((count < 9) ? ':  ': ': ') +
                    coordinates[getMoveSource(moveList[count].move)] +
                    coordinates[getMoveTarget(moveList[count].move)] +
                    (getMovePromoted(moveList[count].move) ?
                    promotedPieces[getMovePromoted(moveList[count].move)]: ' ') +
                    '    nodes: ' + oldNodes);
    }
    
    resultString += '\n   Depth: ' + depth;
    resultString += '\n   Nodes: ' + nodes;
    resultString += '\n    Time: ' + (Date.now() - startTime) + ' ms\n';
    console.log(resultString);
  }


  /****************************\
   ============================
   
            EVALUATION

   ============================              
  \****************************/
  
  /*
      Following material weights and PST values are taken from
         https://hxim.github.io/Stockfish-Evaluation-Guide/
  */
  
  // files mask
  var isolatedPawnMask;
  
  // bonuses & penalties
  const doublePawnPenalty = [11, 56];
  const isolatedPawnPenalty = [5, 15];
  const passedPawnBonus = [0, 7, 8, 12, 29, 48, 86];
  
  // material score
  const materialWeights = [
    // opening material score
    [0, 124, 781, 825, 1276, 2538, 0, -124, -781, -825, -1276, -2538, 0],
    
    // endgame material score
    [0, 206, 854, 915, 1380, 2682, 0, -206, -854, -915, -1380, -2682, 0]
  ];

  const openingPhaseScore = 15258;
  const endgamePhaseScore = 3915;
  const opening = 0, endgame = 1, middlegame = 2;
  const PAWN = 0, KNIGHT = 1, BISHOP = 2, ROOK = 3, QUEEN = 4, KING = 5;

  // piece-square tables
  const pst = [
    // opening PST scores
    [
      //pawn
      [
          0,   0,   0,   0,   0,   0,   0,   0,   o, o, o, o, o, o, o, o,
         -7,   7,  -3, -13,   5, -16,  10,  -8,   o, o, o, o, o, o, o, o,
          5, -12,  -7,  22,  -8,  -5, -15,  -8,   o, o, o, o, o, o, o, o,
         13,   0, -13,   1,  11,  -2, -13,   5,   o, o, o, o, o, o, o, o,
         -4, -23,   6,  20,  40,  17,   4,  -8,   o, o, o, o, o, o, o, o,
         -9, -15,  11,  15,  32,  22,   5, -22,   o, o, o, o, o, o, o, o,
          3,   3,  10,  19,  16,  19,   7,  -5,   o, o, o, o, o, o, o, o,
          0,   0,   0,   0,   0,   0,   0,   0,   o, o, o, o, o, o, o, o
      ],
      
      // knight
      [
       -201, -83, -56, -26, -26, -56, -83,-201,   o, o, o, o, o, o, o, o,
        -67, -27,   4,  37,  37,   4, -27, -67,   o, o, o, o, o, o, o, o,
         -9,  22,  58,  53,  53,  58,  22,  -9,   o, o, o, o, o, o, o, o,
        -34,  13,  44,  51,  51,  44,  13, -34,   o, o, o, o, o, o, o, o,
        -35,   8,  40,  49,  49,  40,   8, -35,   o, o, o, o, o, o, o, o,
        -61, -17,   6,  12,  12,   6, -17, -61,   o, o, o, o, o, o, o, o,
        -77, -41, -27, -15, -15, -27, -41, -77,   o, o, o, o, o, o, o, o,
       -175, -92, -74, -73, -73, -74, -92,-175,   o, o, o, o, o, o, o, o
      ],
      
      // bishop
      [
        -48,   1, -14, -23, -23, -14,   1, -48,   o, o, o, o, o, o, o, o,
        -17, -14,   5,   0,   0,   5, -14, -17,   o, o, o, o, o, o, o, o,
        -16,   6,   1,  11,  11,   1,   6, -16,   o, o, o, o, o, o, o, o,
        -12,  29,  22,  31,  31,  22,  29, -12,   o, o, o, o, o, o, o, o,
         -5,  11,  25,  39,  39,  25,  11,  -5,   o, o, o, o, o, o, o, o,
         -7,  21,  -5,  17,  17,  -5,  21,  -7,   o, o, o, o, o, o, o, o,
        -15,   8,  19,   4,   4,  19,   8, -15,   o, o, o, o, o, o, o, o,
        -53,  -5,  -8, -23, -23,  -8,  -5, -53,   o, o, o, o, o, o, o, o
      ],
      
      // rook
      [
        -17, -19,  -1,   9,   9,  -1, -19, -17,   o, o, o, o, o, o, o, o
         -2,  12,  16,  18,  18,  16,  12,  -2,   o, o, o, o, o, o, o, o,
        -22,  -2,   6,  12,  12,   6,  -2, -22,   o, o, o, o, o, o, o, o,
        -27, -15,  -4,   3,   3,  -4, -15, -27,   o, o, o, o, o, o, o, o,
        -13,  -5,  -4,  -6,  -6,  -4,  -5, -13,   o, o, o, o, o, o, o, o,
        -25, -11,  -1,   3,   3,  -1, -11, -25,   o, o, o, o, o, o, o, o,
        -21, -13,  -8,   6,   6,  -8, -13, -21,   o, o, o, o, o, o, o, o,
        -31, -20, -14,  -5,  -5, -14, -20, -31,   o, o, o, o, o, o, o, o
      ],
      
      // queen
      [
         -2,  -2,   1,  -2,  -2,   1,  -2,  -2,   o, o, o, o, o, o, o, o,
         -5,   6,  10,   8,   8,  10,   6,  -5,   o, o, o, o, o, o, o, o,
         -4,  10,   6,   8,   8,   6,  10,  -4,   o, o, o, o, o, o, o, o,
          0,  14,  12,   5,   5,  12,  14,   0,   o, o, o, o, o, o, o, o,
          4,   5,   9,   8,   8,   9,   5,   4,   o, o, o, o, o, o, o, o,
         -3,   6,  13,   7,   7,  13,   6,  -3,   o, o, o, o, o, o, o, o,
         -3,   5,   8,  12,  12,   8,   5,  -3,   o, o, o, o, o, o, o, o,
          3,  -5,  -5,   4,   4,  -5,  -5,   3,   o, o, o, o, o, o, o, o
      ],
      
      // king
      [
         59,  89,  45,  -1,  -1,  45,  89,  59,   o, o, o, o, o, o, o, o,
         88, 120,  65,  33,  33,  65, 120,  88,   o, o, o, o, o, o, o, o,
        123, 145,  81,  31,  31,  81, 145, 123,   o, o, o, o, o, o, o, o,
        154, 179, 105,  70,  70, 105, 179, 154,   o, o, o, o, o, o, o, o,
        164, 190, 138,  98,  98, 138, 190, 164,   o, o, o, o, o, o, o, o,
        195, 258, 169, 120, 120, 169, 258, 195,   o, o, o, o, o, o, o, o,
        278, 303, 234, 179, 179, 234, 303, 278,   o, o, o, o, o, o, o, o,
        271, 327, 271, 198, 198, 271, 327, 271,   o, o, o, o, o, o, o, o
      ],
    ],
    
    // Endgame PST scores
    [
      //pawn
      [
          0,   0,   0,   0,   0,   0,   0,   0,   o, o, o, o, o, o, o, o,
          0, -11,  12,  21,  25,  19,   4,   7,   o, o, o, o, o, o, o, o,
         28,  20,  21,  28,  30,   7,   6,  13,   o, o, o, o, o, o, o, o,
         10,   5,   4,  -5,  -5,  -5,  14,   9,   o, o, o, o, o, o, o, o,
          6,  -2,  -8,  -4, -13, -12, -10,  -9,   o, o, o, o, o, o, o, o,
        -10, -10, -10,   4,   4,   3,  -6,  -4,   o, o, o, o, o, o, o, o,
        -10,  -6,  10,   0,  14,   7,  -5, -19,   o, o, o, o, o, o, o, o,
          0,   0,   0,   0,   0,   0,   0,   0,   o, o, o, o, o, o, o, o
      ],
      
      // knight
      [
       -100, -88, -56, -17, -17, -56, -88,-100,   o, o, o, o, o, o, o, o,
        -69, -50, -51,  12,  12, -51, -50, -69,   o, o, o, o, o, o, o, o,
        -51, -44, -16,  17,  17, -16, -44, -51,   o, o, o, o, o, o, o, o,
        -45, -16,   9,  39,  39,   9, -16, -45,   o, o, o, o, o, o, o, o,
        -35,  -2,  13,  28,  28,  13,  -2, -35,   o, o, o, o, o, o, o, o,
        -40, -27,  -8,  29,  29,  -8, -27, -40,   o, o, o, o, o, o, o, o,
        -67, -54, -18,   8,   8, -18, -54, -67,   o, o, o, o, o, o, o, o,
        -96, -65, -49, -21, -21, -49, -65, -96,   o, o, o, o, o, o, o, o
      ],
      
      // bishop
      [
        -46, -42, -37, -24, -24, -37, -42, -46,   o, o, o, o, o, o, o, o,
        -31, -20,  -1,   1,   1,  -1, -20, -31,   o, o, o, o, o, o, o, o,
        -30,   6,   4,   6,   6,   4,   6, -30,   o, o, o, o, o, o, o, o,
        -17,  -1, -14,  15,  15, -14,  -1, -17,   o, o, o, o, o, o, o, o,
        -20,  -6,   0,  17,  17,   0,  -6, -20,   o, o, o, o, o, o, o, o,
        -16,  -1,  -2,  10,  10,  -2,  -1, -16,   o, o, o, o, o, o, o, o,
        -37, -13, -17,   1,   1, -17, -13, -37,   o, o, o, o, o, o, o, o,
        -57, -30, -37, -12, -12, -37, -30, -57,   o, o, o, o, o, o, o, o
      ],
      
      // rook
      [
         18,   0,  19,  13,  13,  19,   0,  18,   o, o, o, o, o, o, o, o,
          4,   5,  20,  -5,  -5,  20,   5,   4,   o, o, o, o, o, o, o, o,
          6,   1,  -7,  10,  10,  -7,   1,   6,   o, o, o, o, o, o, o, o,
         -5,   8,   7,  -6,  -6,   7,   8,  -5,   o, o, o, o, o, o, o, o,
         -6,   1,  -9,   7,   7,  -9,   1,  -6,   o, o, o, o, o, o, o, o,
          6,  -8,  -2,  -6,  -6,  -2,  -8,   6,   o, o, o, o, o, o, o, o,
        -12,  -9,  -1,  -2,  -2,  -1,  -9, -12,   o, o, o, o, o, o, o, o,
         -9, -13, -10,  -9,  -9, -10, -13,  -9,   o, o, o, o, o, o, o, o
      ],
      
      // queen
      [
        -75, -52, -43, -36, -36, -43, -52, -75,   o, o, o, o, o, o, o, o,
        -50, -27, -24,  -8,  -8, -24, -27, -50,   o, o, o, o, o, o, o, o,
        -38, -18, -12,   1,   1, -12, -18, -38,   o, o, o, o, o, o, o, o,
        -29,  -6,   9,  21,  21,   9,  -6, -29,   o, o, o, o, o, o, o, o,
        -23,  -3,  13,  24,  24,  13,  -3, -23,   o, o, o, o, o, o, o, o,
        -39, -18,  -9,   3,   3,  -9, -18, -39,   o, o, o, o, o, o, o, o,
        -55, -31, -22,  -4,  -4, -22, -31, -55,   o, o, o, o, o, o, o, o,
        -69, -57, -47,- 26,  26, -47, -57, -69,   o, o, o, o, o, o, o, o
      ],
      
      // king
      [
         11,  59,  73,  78,  78,  73,  59,  11,   o, o, o, o, o, o, o, o,
         47, 121, 116, 131, 131, 116, 121,  47,   o, o, o, o, o, o, o, o,
         92, 172, 184, 191, 191, 184, 172,  92,   o, o, o, o, o, o, o, o,
         96, 166, 199, 199, 199, 199, 166,  96,   o, o, o, o, o, o, o, o,
        103, 156, 172, 172, 172, 172, 156, 103,   o, o, o, o, o, o, o, o,
         88, 130, 169, 175, 175, 169, 130,  88,   o, o, o, o, o, o, o, o,
         53, 100, 133, 135, 135, 133, 100,  53,   o, o, o, o, o, o, o, o,
          1,  45,  85,  76,  76,  85,  45,   1,   o, o, o, o, o, o, o, o
      ]
    ]
  ];

  // mirror positional score tables for opposite side
  const mirrorSquare= [
    a1, b1, c1, d1, e1, f1, g1, h1,   o, o, o, o, o, o, o, o,
    a2, b2, c2, d2, e2, f2, g2, h2,   o, o, o, o, o, o, o, o,
    a3, b3, c3, d3, e3, f3, g3, h3,   o, o, o, o, o, o, o, o,
    a4, b4, c4, d4, e4, f4, g4, h4,   o, o, o, o, o, o, o, o,
    a5, b5, c5, d5, e5, f5, g5, h5,   o, o, o, o, o, o, o, o,
    a6, b6, c6, d6, e6, f6, g6, h6,   o, o, o, o, o, o, o, o,
    a7, b7, c7, d7, e7, f7, g7, h7,   o, o, o, o, o, o, o, o,
    a8, b8, c8, d8, e8, f8, g8, h8,   o, o, o, o, o, o, o, o
  ];
  
  // insufficient material detection
  function isMaterialDraw() {
    if(pieceList[P] == 0 && pieceList[p] == 0) {
      if (pieceList[R] == 0 && pieceList[r] == 0 && pieceList[Q] == 0 && pieceList[q] == 0) {
        if (pieceList[B] == 0 && pieceList[b] == 0) {
          if (pieceList[N] < 3 && pieceList[n] < 3)
            return 1;
      } else if (pieceList[N] == 0 && pieceList[n] == 0) {
        if (Math.abs(pieceList[B] - pieceList[b]) < 2)
          return 1;
      } else if ((pieceList[N] < 3 && pieceList[B] == 0) || (pieceList[B] == 1 && pieceList[N] == 0)) {
        if ((pieceList[n] < 3 && pieceList[b] == 0) || (pieceList[b] == 1 && pieceList[n] == 0))
          return 1;
        }
      } else if (pieceList[Q] == 0 && pieceList[q] == 0) {
        if (pieceList[R] == 1 && pieceList[r] == 1) {
          if ((pieceList[N] + pieceList[B]) < 2 && (pieceList[n] + pieceList[b]) < 2) return 1;
        } else if (pieceList[R] == 1 && pieceList[r] == 0) {        
          if ((pieceList[N] + pieceList[B] == 0) &&
            (((pieceList[n] + pieceList[b]) == 1) || 
             ((pieceList[n] + pieceList[b]) == 2)))
            return 1;
        } else if (pieceList[r] == 1 && pieceList[R] == 0) {
          if ((pieceList[n] + pieceList[b] == 0) &&
            (((pieceList[N] + pieceList[B]) == 1) ||
             ((pieceList[N] + pieceList[B]) == 2)))
            return 1;
        }
      }
    }
    
    return 0;
  }
  
  // get game phase
  function getGamePhaseScore() {
    let gamePhaseScore = 0;

    for (let piece = N; piece <= Q; piece++) gamePhaseScore += pieceList[piece] * materialWeights[opening][piece];
    for (let piece = n; piece <= q; piece++) gamePhaseScore += pieceList[piece] * -materialWeights[opening][piece];

    return gamePhaseScore;
  }
  
  // calculate connected pawns bonus
  function getConnectedPawnBonus(square) {
    if (isConnectedPawn(square) == 0) return 0;
    let opposed = isOpposedPawn(square);
    let supported = isSupportedPawn(square);
    let phalanx = isPhalanxPawn(square);
    let rank = [7 - (square >> 4), square >> 4];
    
    return passedPawnBonus[rank[side]] * (2 + phalanx - opposed) + 21 * supported;
  }
  
  // connected pawns detection
  function isConnectedPawn(square) {
    if (isSupportedPawn(square) || isPhalanxPawn(square)) return 1;
    return 0;
  }
  
  // opposed pawn detection
  function isOpposedPawn(square) {
    if (board[square] == specialMoves.color[side].pawn) {
      if (side == white) {
        for (let rank = square >> 4; rank >= 0; rank--)
          if (board[rank * 16 + (square & 7)] == specialMoves.color[side ^ 1].pawn) return 1;
      } else {
        for (let rank = square >> 4; rank < 8; rank++)
          if (board[rank * 16 + (square & 7)] == specialMoves.color[side ^ 1].pawn) return 1;
      }
      
      return 0;
    }
    
    return 0;
  }
  
  // phalanx pawn detection
  function isPhalanxPawn(square) {
    if (board[square] == specialMoves.color[side].pawn) {
      if (board[square + 1] == specialMoves.color[side].pawn) return 1;
      if (board[square - 1] == specialMoves.color[side].pawn) return 1;
      
      return 0;
    }
    
    return 0;
  }
  
  // supported pawn detection
  function isSupportedPawn(square) {
    if (board[square] == specialMoves.color[side].pawn) {
      if (board[square + 1 - specialMoves.color[side].target] == specialMoves.color[side].pawn) return 1;
      if (board[square - 1 - specialMoves.color[side].target] == specialMoves.color[side].pawn) return 1;
      
      return 0;
    }
    
    return 0;
  }

  // doubled pawns detection
  function isDoublePawn(square) {
    //if (board[square] == specialMoves.color[side].pawn) {
      if (board[square - specialMoves.color[side].target] != specialMoves.color[side].pawn) return 0;
      if (board[square + 1 - specialMoves.color[side].target] == specialMoves.color[side].pawn) return 0;
      if (board[square - 1 - specialMoves.color[side].target] == specialMoves.color[side].pawn) return 0;
      //console.log(coordinates[square])
      return 1
    //}
    
    //return 0;
  }

  // isolated pawns detection
  function isIsolatedPawn(square) {
    if (board[square] == specialMoves.color[side].pawn) {
      if (isolatedPawnMask[side][(square & 7) + 1] == specialMoves.color[side].pawn) return 0;
      if (isolatedPawnMask[side][(square & 7) - 1] == specialMoves.color[side].pawn) return 0;

      return 1;
    }
    
    return 0;
  }
  
  // static evaluation
  function evaluate() {
    if (isMaterialDraw()) return 0;
    
    let gamePhaseScore = getGamePhaseScore();
    let gamePhase = -1;
    
    if (gamePhaseScore > openingPhaseScore) gamePhase = opening;
    else if (gamePhaseScore < endgamePhaseScore) gamePhase = endgame;
    else gamePhase = middlegame;

    let score = 0;
    var scoreOpening = 0;
    var scoreEndgame = 0;

    isolatedPawnMask = [
      [0, 0, 0, 0, 0, 0, 0, 0],  // white
      [0, 0, 0, 0, 0, 0, 0, 0]   // black
    ];
    
    let doublePawns = 0;
    let isolatedPawns = 0;
    let connectedPawnsBonus = 0;
    
    // init white isolated file mask
    for (let pieceIndex = 0; pieceIndex < pieceList[specialMoves.color[side].pawn]; pieceIndex++)
      isolatedPawnMask[side][pieceList.pieces[specialMoves.color[side].pawn * 10 + pieceIndex] & 7] =
        specialMoves.color[side].pawn;
    
    // init black isolated file mask
    for (let pieceIndex = 0; pieceIndex < pieceList[specialMoves.color[side ^ 1].pawn]; pieceIndex++)
      isolatedPawnMask[side ^ 1][pieceList.pieces[specialMoves.color[side ^ 1].pawn * 10 + pieceIndex] & 7] = 
        specialMoves.color[side ^ 1].pawn;
    
    // evaluate pieces
    for (let piece = P; piece <= k; piece++) {
      for (pieceIndex = 0; pieceIndex < pieceList[piece]; pieceIndex++) {
        let square = pieceList.pieces[piece * 10 + pieceIndex];

        // evaluate material
        scoreOpening += materialWeights[opening][piece];
        scoreEndgame += materialWeights[endgame][piece];

        // positional score
        switch (piece) {
          case P:
            scoreOpening += pst[opening][PAWN][square];
            scoreEndgame += pst[endgame][PAWN][square];
            doublePawns += isDoublePawn(square);
            isolatedPawns += isIsolatedPawn(square);
            //scoreOpening += getConnectedPawnBonus(square);
            //scoreEndgame += getConnectedPawnBonus(square);
            break;

          case N:
            scoreOpening += pst[opening][KNIGHT][square];
            scoreEndgame += pst[endgame][KNIGHT][square];
            break;

          case B:
            scoreOpening += pst[opening][BISHOP][square];
            scoreEndgame += pst[endgame][BISHOP][square];
            break;

          case R:
            scoreOpening += pst[opening][ROOK][square];
            scoreEndgame += pst[endgame][ROOK][square];
            break;

          case Q:
            scoreOpening += pst[opening][QUEEN][square];
            scoreEndgame += pst[endgame][QUEEN][square];
            break;

          case K:
            scoreOpening += pst[opening][KING][square];
            scoreEndgame += pst[endgame][KING][square];
            break;

          case p:
            scoreOpening -= pst[opening][PAWN][mirrorSquare[square]];
            scoreEndgame -= pst[endgame][PAWN][mirrorSquare[square]];
            doublePawns += isDoublePawn(square);
            isolatedPawns += isIsolatedPawn(square);
            //scoreOpening -= getConnectedPawnBonus(square);
            //scoreEndgame -= getConnectedPawnBonus(square);
            break;

          case n:
            scoreOpening -= pst[opening][KNIGHT][mirrorSquare[square]];
            scoreEndgame -= pst[endgame][KNIGHT][mirrorSquare[square]];
            break;

          case b:
            scoreOpening -= pst[opening][BISHOP][mirrorSquare[square]];
            scoreEndgame -= pst[endgame][BISHOP][mirrorSquare[square]];
            break;

          case r:
            scoreOpening -= pst[opening][ROOK][mirrorSquare[square]];
            scoreEndgame -= pst[endgame][ROOK][mirrorSquare[square]];
            break;
          
          case q:
            scoreOpening -= pst[opening][QUEEN][mirrorSquare[square]];
            scoreEndgame -= pst[endgame][QUEEN][mirrorSquare[square]];
            break;

          case k:
            scoreOpening -= pst[opening][KING][mirrorSquare[square]];
            scoreEndgame -= pst[endgame][KING][mirrorSquare[square]];
            break;
        }
      }
    }
    
    // pawn structure evaluation
    /*scoreOpening -= isolatedPawns * isolatedPawnPenalty[opening];
    scoreEndgame -= isolatedPawns * isolatedPawnPenalty[endgame];
    scoreOpening -= doublePawns * doublePawnPenalty[opening];
    scoreEndgame -= doublePawns * doublePawnPenalty[endgame];*/

    // interpolate score in the middlegame
    if (gamePhase == middlegame)
      score = (
          scoreOpening * gamePhaseScore +
          scoreEndgame * (openingPhaseScore - gamePhaseScore)
      ) / openingPhaseScore;
    else if (gamePhase == opening) score = scoreOpening;
    else if (gamePhase == endgame) score = scoreEndgame;
    
    /*console.log('double:', doublePawns);
    console.log('isolated:', isolatedPawns);
    console.log('bonus:', connectedPawnsBonus);*/
    //console.log('score', scoreOpening)
    
    score = (score * (100 - fifty) / 100) << 0;
    return (side == white) ? score: -score;
  }


  /****************************\
   ============================
   
              SEARCH

   ============================              
  \****************************/
  
  const mvvLva = [
	  0,   0,   0,   0,   0,   0,   0,  0,   0,   0,   0,   0,   0,
	  0, 105, 205, 305, 405, 505, 605,  105, 205, 305, 405, 505, 605,
	  0, 104, 204, 304, 404, 504, 604,  104, 204, 304, 404, 504, 604,
	  0, 103, 203, 303, 403, 503, 603,  103, 203, 303, 403, 503, 603,
	  0, 102, 202, 302, 402, 502, 602,  102, 202, 302, 402, 502, 602,
	  0, 101, 201, 301, 401, 501, 601,  101, 201, 301, 401, 501, 601,
	  0, 100, 200, 300, 400, 500, 600,  100, 200, 300, 400, 500, 600,

	  0, 105, 205, 305, 405, 505, 605,  105, 205, 305, 405, 505, 605,
	  0, 104, 204, 304, 404, 504, 604,  104, 204, 304, 404, 504, 604,
	  0, 103, 203, 303, 403, 503, 603,  103, 203, 303, 403, 503, 603,
	  0, 102, 202, 302, 402, 502, 602,  102, 202, 302, 402, 502, 602,
	  0, 101, 201, 301, 401, 501, 601,  101, 201, 301, 401, 501, 601,
	  0, 100, 200, 300, 400, 500, 600,  100, 200, 300, 400, 500, 600
  ];
  
  // search  constants
  const maxPly = 64;
  const infinity = 50000;
  const mateValue = 49000;
  const mateScore = 48000;
  const DO_NULL = 1;
  const NO_NULL = 0;
  
  // search variables
  var followPv;
  
  // PV table
  var pvTable = new Array(maxPly * maxPly);
  var pvLength = new Array(maxPly);
  
  // killer moves
  var killerMoves = new Array(2 * maxPly);

  // history moves
  var historyMoves = new Array(13 * 128);
  
  // repetition table
  var repetitionTable = new Array(1000);

  // time control handling  
  var timing = {
    timeSet: 0,
    stopTime: 0,
    stopped: 0,
    time: -1
  }
  
  // set time control
  function setTimeControl(timeControl) { timing = timeControl; }
  
  // reset time control
  function resetTimeControl() {
    timing = {
      timeSet: 0,
      stopTime: 0,
      stopped: 0,
      time: -1
    }
  }
  
  function clearSearch() {
    // reset nodes counter
    nodes = 0;
    timing.stopped = 0;
    searchPly = 0;
    
    for (let index = 0; index < pvTable.length; index++) pvTable[index] = 0;
    for (let index = 0; index < pvLength.length; index++) pvLength[index] = 0;
    for (let index = 0; index < killerMoves.length; index++) killerMoves[index] = 0;
    for (let index = 0; index < historyMoves.length; index++) historyMoves[index] = 0;
  }
  
  // handle time control
  function checkTime() {
    if(timing.timeSet == 1 && Date.now() > timing.stopTime) timing.stopped = 1;
  }

  // position repetition detection
  function isRepetition() {
    for (let index = 0; index < gamePly; index++)
      if (repetitionTable[index] == hashKey) return 1;

    return 0;
  }
  
  // move ordering
  function sortMoves(currentCount, moveList) {
    for (let nextCount = currentCount + 1; nextCount < moveList.length; nextCount++) {
      if (moveList[currentCount].score < moveList[nextCount].score) {
        let tempMove = moveList[currentCount];

        moveList[currentCount] = moveList[nextCount];
        moveList[nextCount] = tempMove;
      }
    }
  }
  
  // sort PV move
  function sortPvMove(moveList) {
    if (followPv) {
      followPv = 0;
      for (let count = 0; count < moveList.length; count++) {
        if (moveList[count].move == pvTable[searchPly]) {
          followPv = 1;
          moveList[count].score = 20000;
          break;
        }
      }
    }
  }
  
  // store PV move
  function storePvMove(move) {
    pvTable[searchPly * 64 + searchPly] = move;
    for (var nextPly = searchPly + 1; nextPly < pvLength[searchPly + 1]; nextPly++)
      pvTable[searchPly * 64 + nextPly] = pvTable[(searchPly + 1) * 64 + nextPly];
    pvLength[searchPly] = pvLength[searchPly + 1]
  }
  
  // quiescence search
  function quiescence(alpha, beta) {
    pvLength[searchPly] = searchPly;
    nodes++;
    
    if((nodes & 2047 ) == 0) {
      checkTime();
      if (timing.stopped == 1) return 0;
    }

    if (searchPly > maxPly - 1) return evaluate();

    let evaluation = evaluate();
    
    if (evaluation >= beta) return beta;
    if (evaluation > alpha) alpha = evaluation;
    
    var moveList = [];
    generateCaptures(moveList);

    // sort PV move
    sortPvMove(moveList);
    
    // loop over moves
    for (var count = 0; count < moveList.length; count++) { 
      sortMoves(count, moveList)
      let move = moveList[count].move;
      
      if (makeMove(move) == 0) continue;
      var score = -quiescence(-beta, -alpha);
      takeBack();
      
      if (timing.stopped == 1) return 0;
      if (score > alpha) {
        storePvMove(move);
        alpha = score;
        
        if (score >= beta) return beta;
      }
    }

    return alpha;
  }
  
  // negamax search
  function negamax(alpha, beta, depth, nullMove) {
    pvLength[searchPly] = searchPly;
    
    let score = 0;
    let pvNode = beta - alpha > 1;
    let futilityPruning = 0;

    if ((nodes & 2047) == 0) {
      checkTime();
      if (timing.stopped == 1) return 0;
    }
    
    if ((searchPly && isRepetition()) || fifty >= 100) return 0;
    if (depth == 0) { nodes++; return quiescence(alpha, beta); }
    
    // mate distance pruning
    if (alpha < -mateValue) alpha = -mateValue;
    if (beta > mateValue - 1) beta = mateValue - 1;
    if (alpha >= beta) return alpha;
    
    let legalMoves = 0;
    let inCheck = isSquareAttacked(kingSquare[side], side ^ 1);
    
    // check extension
    if (inCheck) depth++;
    
    if (inCheck == 0 && pvNode == 0) {
      // static evaluation for pruning purposes
      let staticEval = evaluate();
    
      // evalution pruning
      if (depth < 3 && Math.abs(beta - 1) > -mateValue + 100) {
        let evalMargin = 120 * depth;
        if (staticEval - evalMargin >= beta) return staticEval - evalMargin;
      }
      
      if (nullMove) {
        // null move pruning
        if ( searchPly && depth > 2 && staticEval >= beta) {
          makeNullMove();
          score = -negamax(-beta, -beta + 1, depth - 1 - 2, NO_NULL);
          takeNullMove();

          if (timing.stopped == 1) return 0;
          if (score >= beta) return beta;
        }
        
        // razoring
        score = staticEval + 125;
        let newScore;
        
        if (score < beta) {
          if (depth == 1) {
            newScore = quiescence(alpha, beta);
            return (newScore > score) ? newScore : score;
          }
        }
        
        score += 175;
        
        if (score < beta && depth < 4) {
          newScore = quiescence(alpha, beta);
          if (newScore < beta) return (newScore > score) ? newScore : score;
        }
      }
      
      // futility condition
      let futilityMargin = [0, 200, 300, 500];
      if (depth < 4 && Math.abs(alpha) < 9000 && staticEval + futilityMargin[depth] <= alpha)
        futilityPruning = 1;
      
    }

    let movesSearched = 0;
    let moveList = [];
    generateMoves(moveList);
    
    // sort PV move
    sortPvMove(moveList);
    
    // loop over moves
    for (let count = 0; count < moveList.length; count++) {
      sortMoves(count, moveList);
      let move = moveList[count].move;
      if (makeMove(move) == 0) continue;
      legalMoves++;
      
      // futility pruning
      if (futilityPruning &&
          movesSearched &&
          getMoveCapture(move) == 0 &&
          getMovePromoted(move) == 0 &&
          isSquareAttacked(kingSquare[side], side ^ 1) == 0
         ) { takeBack(); continue; }
      
      if (movesSearched == 0) score = -negamax(-beta, -alpha, depth - 1, DO_NULL);
      else {
        // LMR
        if(
            pvNode == 0 &&
            movesSearched > 3 &&
            depth > 2 &&
            inCheck == 0 &&
            (getMoveSource(move) != getMoveSource(killerMoves[searchPly]) ||
             getMoveTarget(move) != getMoveTarget(killerMoves[searchPly])) &&
            (getMoveSource(move) != getMoveSource(killerMoves[maxPly + searchPly]) ||
             getMoveTarget(move) != getMoveTarget(killerMoves[maxPly + searchPly])) &&
            getMoveCapture(move) == 0 &&
            getMovePromoted(move) == 0
          ) {
            score = -negamax(-alpha - 1, -alpha, depth - 2, DO_NULL);
        } else score = alpha + 1;
          
        // PVS
        if(score > alpha) {
          score = -negamax(-alpha - 1, -alpha, depth - 1, DO_NULL);
          if((score > alpha) && (score < beta)) score = -negamax(-beta, -alpha, depth - 1, DO_NULL);
        }
      }
      
      takeBack();
      movesSearched++;
      
      if (timing.stopped == 1) return 0;
      if (score > alpha) {
        alpha = score;
        storePvMove(move);
        
        // store history moves
        if (getMoveCapture(move) == 0)
          historyMoves[board[getMoveSource(move)] * 128 + getMoveTarget(move)] += depth;
        
        if (score >= beta) {
          // store killer moves
          if (getMoveCapture(move) == 0) {
            killerMoves[maxPly + searchPly] = killerMoves[searchPly];
            killerMoves[searchPly] = move;
          }
          
          return beta;
        }
      }
    }
    
    // checkmate or stalemate
    if (legalMoves == 0) {
      if (inCheck) return -mateValue + searchPly;
      else return 0;
    }

    return alpha;
  }
  
  // search position for the best move
  function searchPosition(depth) {
    let start = Date.now();
    let score = 0;
    let lastBestMove = 0;
    
    clearSearch();

    // iterative deepening
    for (let currentDepth = 1; currentDepth <= depth; currentDepth++) {
      lastBestMove = pvTable[0];
      followPv = 1;
      score = negamax(-infinity, infinity, currentDepth, DO_NULL);
      
      // stop searching if time is up
      if (timing.stopped == 1 || 
         ((Date.now() > timing.stopTime) &&
          timing.time != -1)) break;
      
      let info = '';
      
      if (typeof(document) != 'undefined')
        var guiScore = 0;
      
      if (score >= -mateValue && score <= -mateScore) {
        info = 'info score mate ' + (parseInt(-(score + mateValue) / 2 - 1)) + 
               ' depth ' + currentDepth +
               ' nodes ' + nodes +
               ' time ' + (Date.now() - start) +
               ' pv ';
               
        if (typeof(document) != 'undefined')
          guiScore = 'mate in ' + Math.abs((parseInt(-(score + mateValue) / 2 - 1)));
      } else if (score >= mateScore && score <= mateValue) {
        info = 'info score mate ' + (parseInt((mateValue - score) / 2 + 1)) + 
               ' depth ' + currentDepth +
               ' nodes ' + nodes +
               ' time ' + (Date.now() - start) +
               ' pv ';
             
        if (typeof(document) != 'undefined')
          guiScore = 'mate in ' + Math.abs((parseInt((mateValue - score) / 2 + 1)));
      } else {
        info = 'info score cp ' + score + 
               ' depth ' + currentDepth +
               ' nodes ' + nodes +
               ' time ' + (Date.now() - start) +
               ' pv ';
        
        if (typeof(document) != 'undefined')
          guiScore = -score;
      }
      
      for (let count = 0; count < pvLength[0]; count++)
        info += moveToString(pvTable[count]) + ' ';
                
      console.log(info);
      
      if (typeof(document) != 'undefined') {
        if (guiScore == 49000) guiScore = 'mate in 1';
        else document.getElementById('score').innerHTML = guiScore;
        document.getElementById('info').innerHTML = info.split('pv ')[1];
      }
      
      if (info.includes('mate') || info.includes('-49000')) break;
    }

    let bestMove = (timing.stopped == 1) ? lastBestMove: pvTable[0];
    console.log('bestmove ' + moveToString(bestMove));
    return bestMove;
  }


  /****************************\
   ============================
   
          INPUT & OUTPUT

   ============================              
  \****************************/
  
  // castling bits
  var KC = 1, QC = 2, kc = 4, qc = 8;

  // decode promoted pieces
  var promotedPieces = {
    [Q]: 'q', [R]: 'r', [B]: 'b', [N]: 'n',
    [q]: 'q', [r]: 'r', [b]: 'b', [n]: 'n'
  };

  // encode ascii pieces
  var charPieces = {
      'P': P, 'N': N, 'B': B, 'R': R, 'Q': Q, 'K': K,
      'p': p, 'n': n, 'b': b, 'r': r, 'q': q, 'k': k,
  };
  
  // unicode piece representation
  const unicodePieces = [
    '.', '\u2659', '\u2658', '\u2657', '\u2656', '\u2655', '\u2654',
         '\u265F', '\u265E', '\u265D', '\u265C', '\u265B', '\u265A'
  ];

  // set board position from FEN
  function setBoard(fen) {
    resetBoard();
    var index = 0;
    
    // parse board position
    for (var rank = 0; rank < 8; rank++) {
      for (var file = 0; file < 16; file++) {
        var square = rank * 16 + file;
        if ((square & 0x88) == 0) {
          if ((fen[index].charCodeAt() >= 'a'.charCodeAt() &&
               fen[index].charCodeAt() <= 'z'.charCodeAt()) || 
              (fen[index].charCodeAt() >= 'A'.charCodeAt() &&
               fen[index].charCodeAt() <= 'Z'.charCodeAt())) {
            if (fen[index] == 'K') kingSquare[white] = square;
            else if (fen[index] == 'k') kingSquare[black] = square;
            board[square] = charPieces[fen[index]];
            index++;
          }
          if (fen[index].charCodeAt() >= '0'.charCodeAt() &&
              fen[index].charCodeAt() <= '9'.charCodeAt()) {
            var offset = fen[index] - '0';
            if (!(board[square])) file--;
            file += offset;
            index++;
          }
          if (fen[index] == '/') index++;
        }
      }
    }
    
    // parse side to move
    index++;
    side = (fen[index] == 'w') ? white : black;
    index += 2;
    
    // parse castling rights
    while (fen[index] != ' ') {
      switch(fen[index]) {
        case 'K': castle |= KC; break;
        case 'Q': castle |= QC; break;
        case 'k': castle |= kc; break;
        case 'q': castle |= qc; break;
        case '-': break;
      }

      index++;
    }
    
    index++;
    
    // parse enpassant square
    if (fen[index] != '-') {
      var file = fen[index].charCodeAt() - 'a'.charCodeAt();
      var rank = 8 - (fen[index + 1].charCodeAt() - '0'.charCodeAt());
      enpassant = rank * 16 + file;
    } else enpassant = noEnpassant;
    
    // parse 50 rule move counter
    fifty = parseInt(fen.slice(index, fen.length - 1).split(' ')[1]);

    // parse full move counter
    gamePly = parseInt(fen.slice(index, fen.length + 1).split(' ')[2]) * 2;

    // generate unique position identifier
    hashKey = generateHashKey();

    // init piece list
    initPieceList();
  }
  
  // load move sequence
  function loadMoves(moves) {
    moves = moves.split(' ');
    
    for (let index = 0; index < moves.length; index++) {
      let move = moves[index];
      let moveString = moves[index];
      let validMove = moveFromString(move);
      if (validMove) makeMove(validMove);
    }
    
    searchPly = 0;
  }
  
  // print chess board to console
  function printBoard() {
    var boardString = '';
    
    // print board position
    for (var rank = 0; rank < 8; rank++) {
      for (var file = 0; file < 16; file++) {
        var square = rank * 16 + file;
        if (file == 0) boardString += '   ' + (8 - rank).toString() + ' ';
        if ((square & 0x88) == 0) boardString += unicodePieces[board[square]] + ' ';
      }
      boardString += '\n'
    }
    
    boardString += '     a b c d e f g h';
    
    // print board state variables
    boardString += '\n\n     Side:     ' + ((side == 0) ? 'white': 'black');
    boardString += '\n     Castling:  ' + ((castle & KC) ? 'K' : '-') + 
                                        ((castle & QC) ? 'Q' : '-') +
                                        ((castle & kc) ? 'k' : '-') +
                                        ((castle & qc) ? 'q' : '-');
    boardString += '\n     Ep:          ' + ((enpassant == noEnpassant) ? 'no': coordinates[enpassant]);
    boardString += '\n\n     Key: ' + hashKey;
    boardString += '\n 50 rule:          ' + fifty;
    boardString += '\n   moves:          ' + ((gamePly % 2) ? Math.round(gamePly / 2) - 1 : Math.round(gamePly / 2));
    console.log(boardString + '\n');
  }
  
  // print move
  function moveToString(move) {
    if (getMovePromoted(move)) {
      return coordinates[getMoveSource(move)] +
             coordinates[getMoveTarget(move)] +
             promotedPieces[getMovePromoted(move)];
    } else {
      return coordinates[getMoveSource(move)] +
             coordinates[getMoveTarget(move)];
    }
  }

  // print move list
  function printMoveList(moveList) {
    var listMoves = '   Move     Capture  Double   Enpass   Castling  Score\n\n';
    
    for (var index = 0; index < moveList.length; index++) {
      var move = moveList[index].move;
      listMoves += '   ' + coordinates[getMoveSource(move)] + coordinates[getMoveTarget(move)];
      listMoves += (getMovePromoted(move) ? promotedPieces[getMovePromoted(move)] : ' ');
      listMoves += '    ' + getMoveCapture(move) +
                    '        ' + getMovePawn(move) +
                    '        ' + getMoveEnpassant(move) +
                    '        ' + getMoveCastling(move) + 
                    '         ' + moveList[index].score + '\n';
    }
    
    listMoves += '\n   Total moves: ' + moveList.length;
    console.log(listMoves);
  }
  
  // print piece list & material counts
  function printPieceList() {
    var materialCountString = '    Material counts:\n\n';
    
    // print material count
    for (var piece = P; piece <= k; piece++)
      materialCountString += '    ' + unicodePieces[piece] + ': ' + pieceList[piece] + '\n';

    console.log(materialCountString);
    var pieceListString = '    Piece list:\n\n';
    
    // print piece-square pairs
    for (var piece = P; piece <= k; piece++)
      for (var pieceNumber = 0; pieceNumber < pieceList[piece]; pieceNumber++)
        pieceListString += '    ' + unicodePieces[piece] + ': ' + 
                                    coordinates[pieceList.pieces[piece * 10 + pieceNumber]] + '\n';
  }

  /****************************\
   ============================
   
               GUI

   ============================              
  \****************************/
  
  // browser mode
  if (typeof(document) != 'undefined') { 
    // color theme
    var LIGHT_SQUARE = '#f0d9b5';
    var DARK_SQUARE = '#b58863';
    var SELECT_COLOR = 'brown';
    
    // square size
    var CELL_WIDTH = 50;
    var CELL_HEIGHT = 50;
    
    // override board appearance
    if (boardSize) { CELL_WIDTH = boardSize / 8; CELL_HEIGHT = boardSize / 8; }
    if (lightSquare) LIGHT_SQUARE = lightSquare;
    if (darkSquare) DARK_SQUARE = darkSquare;
    if (selectColor) SELECT_COLOR = selectColor;
    
    // flip board
    var flip = 0;
    
    // flip board
    function flipBoard() { flip ^= 1; }
    
    // render board in browser
    function drawBoard() {
      var chessBoard = '<table align="center" style="border: 1px solid black" cellspacing="0">'
      
      // board table
      for (var row = 0; row < 8; row++) {
        chessBoard += '<tr>'
        for (var col = 0; col < 16; col++) {
          var file, rank;
          if (flip) {
            file = 16 - 1 - col;
            rank = 8 - 1 - row;
          } else {
            file = col;
            rank = row;
          }
          
          var square = rank * 16 + file;
          
          if ((square & 0x88) == 0)
            chessBoard += 
              '<td align="center" id="' + square + 
              '" bgcolor="' + ( ((file + rank) % 2) ? DARK_SQUARE : LIGHT_SQUARE) +
              '" width="' + CELL_WIDTH + 'px" height="' + CELL_HEIGHT +  'px" ' +
              ' onclick="tapPiece(this.id)" ' + 
              ' ondragstart="dragPiece(event, this.id)" ' +
              ' ondragover="dragOver(event, this.id)"'+
              ' ondrop="dropPiece(event, this.id)"' +
              '></td>';
        }

        chessBoard += '</tr>';
      }

      chessBoard += '</table>';
      document.getElementById('chessboard').innerHTML = chessBoard;
    }

    // draw pieces
    function updateBoard() {
      for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 16; col++) {
          var square = row * 16 + col;
          if ((square & 0x88) == 0)
            document.getElementById(square).innerHTML = 
              '<img style="width: ' + 
               (boardSize ? boardSize / 8: 400 / 8) + 
              'px" draggable="true" src ="Images/' + 
              (board[square]) +'.gif">';
        }
      }
    }
    
    // move piece in GUI
    function movePiece(userSource, userTarget, promotedPiece) {
      let moveString = coordinates[userSource] +
                       coordinates[userTarget] +
                       promotedPieces[promotedPiece];

      engine.loadMoves(moveString);
      drawBoard();
      updateBoard();
    }

    // render board initially
    drawBoard();
    updateBoard();
  }
  
  function guiError(func) {
    console.log(func + ' is available only in browser');
  }
  

  /****************************\
   ============================
   
               INIT

   ============================              
  \****************************/
  
  // init all
  (function initAll() {
    initRandomKeys();
    hashKey = generateHashKey();
    initPieceList();
  }())


  /****************************\
   ============================
   
            DEBUGGING

   ============================              
  \****************************/
  
  // below you can test inner engine methods
  function debug() {
    //setBoard('kqb5/pppppppp/8/8/8/8/PPPPPPPP/KQR5 w K7 - 0 1 ');
    //setBoard('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 10 ');
    //setBoard('r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10');
    //setBoard('rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8');
    //setBoard('rnbqkbnr/pp4pp/2p5/3Npp2/2PpP3/3P1P2/PP4PP/R1BQKBNR b KQkq e3 0 6 ');
    //setBoard('rn2kb1r/pp5p/5n2/2p5/4pN2/111P4/PPP2PPP/R2Q1RK1 w kq - 0 15 ');
    //setBoard('8/1p3p2/ppp2p2/8/5P2/PPP2P2/1P6/8 b - - 4 1 ');
    //setBoard('8/p1p1p1pp/8/8/8/8/PP1P1P1P/8 b - - 4 1 ');
    setBoard('8/8/2pp2p1/pp1p2p1/1P1P2PP/2PP2P1/8/8 w - - 4 1 ');
    updateBoard();
    evaluate();
  }
  
  return {
  
    /****************************\
     ============================
   
              PUBLIC API

     ============================              
    \****************************/
    
    // GUI constants
    SELECT_COLOR: SELECT_COLOR,
    
    // Engine constants
    VERSION: version,
    ELO: elo,
    START_FEN: startFen,
    
    COLOR: {
      WHITE: white,
      BLACK: black,
    },
    
    PIECE: {
      NO_PIECE: e,
      WHITE_PAWN: P,
      WHITE_KNIGHT: N,
      WHITE_BISHOP: B,
      WHITE_ROOK: R,
      WHITE_QUEEN: Q,
      WHITE_KING: K,
      BLACK_PAWN: p,
      BLACK_KNIGHT: n,
      BLACK_BISHOP: b,
      BLACK_ROOK: r,
      BLACK_QUEEN: q,
      BLACK_KING: k
    },
    
    SQUARE: {
      A8: a8, B8: b8, C8: c8, D8: d8, E8: e8, F8: f8, G8: g8, H8: h8,
      A7: a7, B7: b7, C7: c7, D7: d7, E7: e7, F7: f7, G7: g7, H7: h7,
      A6: a6, B6: b6, C6: c6, D6: d6, E6: e6, F6: f6, G6: g6, H6: h6,
      A5: a5, B5: b5, C5: c5, D5: d5, E5: e5, F5: f5, G5: g5, H5: h5,
      A4: a4, B4: b4, C4: c4, D4: d4, E4: e4, F4: f4, G4: g4, H4: h4,
      A3: a3, B3: b3, C3: c3, D3: d3, E3: e3, F3: f3, G3: g3, H3: h3,
      A2: a2, B2: b2, C2: c2, D2: d2, E2: e2, F2: f2, G2: g2, H2: h2,
      A1: a1, B1: b1, C1: c1, D1: d1, E1: e1, F1: f1, G1: g1, H1: h1,
    },
    
    // GUI methods
    drawBoard: function() { try { return drawBoard(); } catch(e) { guiError('.drawBoard()'); } },
    updateBoard: function() { try { return updateBoard(); } catch(e) { guiError('.updateBoard()'); } },
    movePiece: function(userSource, userTarget, promotedPiece) { try { movePiece(userSource, userTarget, promotedPiece); } catch(e) { guiError('.movePiece()'); } },
    flipBoard: function() { try { flipBoard(); } catch(e) { guiError('.flipBoard()'); } },

    // perft
    perft: function(depth) { perftTest(depth); },

    // board methods
    squareToString: function(square) { return coordinates[square]; },
    promotedToString: function(piece) { return promotedPieces[piece]; },
    printBoard: function() { printBoard(); },
    setBoard: function(fen) { setBoard(fen); },
    getPiece: function(square) { return board[square]; },
    getSide: function() { return side; },
    getFifty: function() { return fifty; },
    
    // move manipulation
    moveFromString: function(moveString) { return moveFromString(moveString); },
    moveToString: function(move) { return moveToString(move); },
    loadMoves: function(moves) { loadMoves(moves); },
    getMoveSource: function(move) { return getMoveSource(move); },
    getMoveTarget: function(move) { return getMoveTarget(move); },
    getMovePromoted: function(move) { return getMovePromoted(move); },
    generateLegalMoves: function() { return generateLegalMoves(); },
    printMoveList: function(moveList) { printMoveList(moveList); },
    
    // timing
    resetTimeControl: function() { resetTimeControl(); },
    setTimeControl: function(timeControl) { setTimeControl(timeControl); },
    getTimeControl: function() { return JSON.parse(JSON.stringify(timing))},
    search: function(depth) { return searchPosition(depth) },

    // misc
    isMaterialDraw: function() { return isMaterialDraw(); },
    takeBack: function() { if (moveStack.length) takeBack(); },
    isRepetition: function() { return isRepetition(); },
    inCheck: function() { return isSquareAttacked(kingSquare[side], side ^ 1); },
    
    
    // debugging (run any internal engine function)
    debug: function() { debug(); }
  }
}

// export as nodejs module
if (typeof(exports) != 'undefined') exports.Engine = Engine;


