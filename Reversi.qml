import QtQuick 2.8
import QtQuick.Window 2.0
import QtQuick.Controls 1.4
import QtQuick.Controls.Styles 1.4
import "ReversiGame.js" as Reversi
import QtQuick.Layouts 1.0

Window {
    id: root
    title: "Reversi"
    width: 600
    height: width
    maximumHeight: Screen.height <= Screen.width ? Screen.height - 100 : Screen.width - 100
    maximumWidth: maximumHeight
    minimumWidth: 300
    minimumHeight: minimumWidth

    Label {
        id: score
        readonly property int blackVal: gameBoard.model.getPlayerScore(Reversi.colorEnum.BLACK)
        readonly property int whiteVal: gameBoard.model.getPlayerScore(Reversi.colorEnum.WHITE)
        text: "BLACK " + blackVal + " | " + whiteVal + " WHITE"
        verticalAlignment: Text.AlignVCenter
        horizontalAlignment: Text.AlignHCenter
        font.pixelSize: 22
        color: "black"
        width: parent.width
        anchors.top: parent.top
        anchors.topMargin: 10
    }

    Item {
        id: gameBoard
        property int blockSize: parent.width / 10
        property int currentBlock: -1
        property var model: new Reversi.Reversi()
        property var player: Reversi.getPlayer()
        width: blockSize * Reversi.columnsCount
        height: width
        anchors.horizontalCenter: score.horizontalCenter
        anchors.top: score.bottom
        anchors.topMargin: 10

        function resetModel()
        {
            Reversi.getStartPlayer()
            model = new Reversi.Reversi()
        }

        function nextPlayer()
        {
            var i = -1
            do
            {
                ++i
                if(i < 2)
                    Reversi.nextPlayer()
                else
                    Reversi.setPlayer(Reversi.colorEnum.BLANK)
            } while (i < 2 && !model.hasMoves())
        }

        Grid
        {
            id: gameBlocks
            rows: Reversi.rowsCount
            columns: Reversi.columnsCount
            width: parent.width
            height: parent.height
            anchors.fill: parent

            Repeater {
                id: repeaterBlocks
                model: gameBoard.model
                anchors.fill: parent

                delegate: Rectangle {
                    id: block
                    readonly property int value: gameBoard.model[index]
                    readonly property int row: index / Reversi.rowsCount
                    readonly property int col: index % Reversi.columnsCount
                    property variant blocks: [] // blocks that could be taken over by current player
                    x: col*width; y: row*width
                    width: gameBoard.blockSize
                    height: width
                    border { color: "black"; width: 1 }
                    color: Qt.hsla(0.35, 1, 0.5)

                    function changeColor(c)
                    {
                        for(var i = 0; i < blocks.length; ++i)
                        {
                            var pos = blocks[i]
                            repeaterBlocks.itemAt(pos).color = c
                        }
                    }

                    MouseArea
                    {
                        anchors.fill: parent
                        hoverEnabled: true
                        onHoveredChanged:
                        {
                            if(gameBoard.model[index] === Reversi.colorEnum.BLANK)
                            {
                                if(gameBoard.currentBlock !== index)
                                {
                                    parent.color = Qt.hsla(0.6, 1, 0.5)
                                    gameBoard.currentBlock = index
                                    parent.blocks = gameBoard.model.isValidMove(row, col)
                                    parent.changeColor(Qt.hsla(1, 1, 0.4))
                                }
                                else
                                {
                                    parent.color = Qt.hsla(0.35, 1, 0.5)
                                    parent.changeColor(Qt.hsla(0.35, 1, 0.5))
                                    gameBoard.currentBlock = -1
                                }
                            }
                        }

                        onClicked:
                        {
                            if(blocks.length > 0)
                            {
                                var m = gameBoard.model.doMove(row, col, blocks);
                                parent.changeColor(Qt.hsla(0.35, 1, 0.5))
                                gameBoard.nextPlayer()
                                gameBoard.currentBlock = -1
                                gameBoard.model = m
                            }
                        }
                    }

                    Item
                    {
                        id: diskPanel
                        width: gameBoard.blockSize / 1.5
                        height: width
                        visible: gameBoard.model[index] === Reversi.colorEnum.BLANK ? false : true
                        anchors.centerIn: parent
                        Rectangle {
                            id: disk
                            width: parent.width
                            height: width
                            radius: width / 2
                            color: gameBoard.model[index] === Reversi.colorEnum.BLACK ? "Black" : "White"
                        }
                    }
                }
            }
        }
    }

    Button {
        id: resetButton
        text: "Restart game"
        anchors.top: gameBoard.bottom
        anchors.topMargin: 20
        anchors.right: parent.right
        anchors.rightMargin: 20

        style: ButtonStyle {
            background: Rectangle {
                border.width: 1
                gradient: Gradient {
                    GradientStop { position: 0 ; color: control.pressed ? "#ccc" : "#eee" }
                    GradientStop { position: 1 ; color: control.pressed ? "#aaa" : "#ccc" }
                }
            }
        }

        onClicked:
        {
            gameBoard.resetModel()
        }
    }

    Label {
        text: gameBoard.model.info(score.blackVal, score.whiteVal)
        font.pixelSize: 22
        color: "black"
        width: parent.width / 2
        anchors.top: gameBoard.bottom
        anchors.topMargin: 20
        anchors.left: parent.left
        anchors.leftMargin: 20
    }
}
