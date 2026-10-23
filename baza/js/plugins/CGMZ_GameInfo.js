/*:
 * @author Casper Gaming
 * @url https://www.caspergaming.com/plugins/cgmz/gameinfo/
 * @target MZ
 * @base CGMZ_Core
 * @orderAfter CGMZ_Core
 * @plugindesc Adds text fields to the title screen for copyright/website/etc.
 * @help
 * ============================================================================
 * For terms and conditions using this plugin in your game please visit:
 * https://www.caspergaming.com/terms-of-use/
 * ============================================================================
 * Become a Patron to get access to beta/alpha plugins plus other goodies!
 * https://www.patreon.com/CasperGamingRPGM
 * ============================================================================
 * Version: 1.1.3
 * ----------------------------------------------------------------------------
 * Compatibility: Only tested with my CGMZ plugins.
 * Made for RPG Maker MZ 1.6.0
 * ----------------------------------------------------------------------------
 * Description: This plugin adds three text fields to the title screen, such as
 * as version info, a link to your website, copyright information, or anything
 * else.
 * ----------------------------------------------------------------------------
 * Documentation:
 * This plugin does not use plugin commands.
 *
 * Version History:
 * 1.0.0 - Initial release
 *
 * 1.1.0:
 * - Added ability to add buttons on the title screen for social media, patron,
 *   discord, etc.
 *
 * 1.1.1:
 * - Fixed bug with buttons disappearing in some cases
 * - Added cursor change to a pointer over the buttons
 *
 * 1.1.2:
 * - Websites now open in user default browser (local mode only)
 *
 * 1.1.3:
 * - Bugfix for pointer cursor staying if select with keyboard
 *
 * @param Text Options
 *
 * @param Font Size
 * @parent Text Options
 * @type number
 * @min 1
 * @default 12
 * @desc Size of the font
 *
 * @param Font Outline Width
 * @parent Text Options
 * @type number
 * @min 0
 * @default 2
 * @desc Bigger number means the outline will be wider. Set to 0 for no outline.
 *
 * @param Font Outline Color
 * @parent Text Options
 * @type text
 * @default black
 * @desc The color of the outline
 * 
 * @param Left Text
 * @parent Text Options
 * @type text
 * @default 
 * @desc Text to display in the lower left corner of the title screen
 * 
 * @param Center Text
 * @parent Text Options
 * @type text
 * @default 
 * @desc Text to display in the center bottom of the title screen
 * 
 * @param Right Text
 * @parent Text Options
 * @type text
 * @default 
 * @desc Text to display in the bottom right of the title screen
 *
 * @param Buttons
 * @type struct<Button>[]
 * @default []
 * @desc Set up clickable buttons here
*/
/*~struct~Button:
 * @param Image
 * @type file
 * @dir img/pictures
 * @default 
 * @desc The image file (stored in pictures folder) to use
 *
 * @param x
 * @type number
 * @min 0
 * @default 0
 * @desc The x coordinate to show the button
 *
 * @param y
 * @type number
 * @min 0
 * @default 0
 * @desc The y coordinate to show the button
 *
 * @param width
 * @type number
 * @min 1
 * @default 50
 * @desc The width of the button
 *
 * @param height
 * @type number
 * @min 1
 * @default 50
 * @desc The height of the button
 *
 * @param URL
 * @type text
 * @default 
 * @desc Enter in a website url which will be launched on click
*/
/*:zh-CN
 * @author Casper Gaming
 * @url https://www.caspergaming.com/plugins/cgmz/gameinfo/
 * @target MZ
 * @base CGMZ_Core
 * @orderAfter CGMZ_Core
 * @plugindesc 游戏信息系统（在标题画面添加游戏信息和带链接的按钮）
 * @help
 * ============================================================================
 * 【使用条款】
 * 1、本插件可作商用或非商用。
 * 2、须注明插件作者"Casper Gaming"。
 * 3、须提供该插件的作者网站链接。
 * 4、最终使用条款以作者官网公告为准。https://www.caspergaming.com/terms-of-use/
 * ============================================================================
 * 【赞助支持】
 * 您可以登陆以下网站并对作者进行支持和赞助。
 * 然后获得作者和其插件的最新资讯，以及测试版插件的试用。
 * https://www.patreon.com/CasperGamingRPGM
 * ============================================================================
 * 【插件版本】V 1.1.3
 * ----------------------------------------------------------------------------
 * 【兼容性】仅测试作者所制作的插件
 * 【RM版本】RPG Maker MZ 1.6.0
 * ----------------------------------------------------------------------------
 * 【插件描述】 
 * 1、在标题画面下方添加三段文字信息。如游戏版本、网站等。
 * 2、在标题画面添加带有链接的按钮。
 * ----------------------------------------------------------------------------
 * 【使用说明】本插件不支持事件的插件指令。
 *
 * ----------------------------------------------------------------------------
 * 【版本历史】
 * V 1.0.0 - 原始版本
 *
 * V 1.1.0 - 新增功能：在标题画面可以添加社交媒体、赞助人等带链接的按钮。
 *
 * V 1.1.1 
 * 1、修复了某些情况下按钮会消失的BUG。
 * 2、新增功能：将鼠标指针放到按钮上会高亮显示。
 *
 * V 1.1.2 - 以用户默认的浏览器打开网站。（仅限本地模式）
 *
 * V 1.1.3 - 修复了当使用键盘选择时鼠标指针出现异常的BUG
 *
 * @param Text Options
 * @text 文本设置
 *
 * @param Font Size
 * @text 字体大小
 * @parent Text Options
 * @type number
 * @min 1
 * @default 12
 * @desc 设置底部信息文本的字体大小。（默认12）
 *
 * @param Font Outline Width
 * @text 文字描边大小
 * @parent Text Options
 * @type number
 * @min 0
 * @default 2
 * @desc 设置底部信息文本的描边大小。（默认2，设置0为无描边）
 *
 * @param Font Outline Color
 * @text 文字描边颜色
 * @parent Text Options
 * @type text
 * @default black
 * @desc 设置底部信息文本的描边颜色。（默认黑色，应该可以使用#FFFFFF格式或任意html颜色格式）
 * 
 * @param Left Text
 * @text 底部左侧信息
 * @parent Text Options
 * @type text
 * @default 
 * @desc 设置标题画面底部左侧的文本信息。
 * 
 * @param Center Text
 * @text 底部中间信息
 * @parent Text Options
 * @type text
 * @default 
 * @desc 设置标题画面底部中间的文本信息。
 * 
 * @param Right Text
 * @text 底部右侧信息
 * @parent Text Options
 * @type text
 * @default 
 * @desc 设置标题画面底部右侧的文本信息。
 *
 * @param Buttons
 * @text 添加按钮
 * @type struct<Button>[]
 * @default []
 * @desc 设置并添加一个按钮在标题屏幕上。
*/
/*~struct~Button:zh-CN
 * @param Image
 * @text 按钮图片
 * @type file
 * @dir img/pictures
 * @default 
 * @desc 选择使用一张图片作为按钮。（图片路径：工程/img/pictures）
 *
 * @param x
 * @text X轴坐标
 * @type number
 * @min 0
 * @default 0
 * @desc 图标在标题画面里的X轴坐标位置。
 *
 * @param y
 * @text Y轴坐标
 * @type number
 * @min 0
 * @default 0
 * @desc 图标在标题画面里的Y轴坐标位置。
 *
 * @param width
 * @text 按钮宽度
 * @type number
 * @min 1
 * @default 50
 * @desc 按钮的图片尺寸的宽度。（默认50）
 *
 * @param height
 * @text 按钮高度
 * @type number
 * @min 1
 * @default 50
 * @desc 按钮的图片尺寸的高度。（默认50）
 *
 * @param URL
 * @text 链接
 * @type text
 * @default 
 * @desc 设置一个点击按钮后可以跳转的URL链接。
*/
/*:es
 * @author Casper Gaming
 * @url https://www.caspergaming.com/plugins/cgmz/gameinfo/
 * @target MZ
 * @base CGMZ_Core
 * @orderAfter CGMZ_Core
 * @plugindesc Agrega campos de texto a la pantalla de titulo para derechos de autor/sitio web/etc.
 * @help
 * ============================================================================
 * Para terminos y condiciones de uso de este pluging en tu juego, por favor visita:
 * https://www.caspergaming.com/terms-of-use/
 * ============================================================================
 * ¡Conviértete en un Patrocinador para obtener acceso a los plugings beta y alfa, ademas de otras cosas geniales!
 * https://www.patreon.com/CasperGamingRPGM
 * ============================================================================
 * Versión: 1.1.3
 * ----------------------------------------------------------------------------
 * Compatibilidad: Sólo probado con mis CGMZ plugins.
 * Hecho para RPG Maker MZ 1.6.0
 * ----------------------------------------------------------------------------
 * Descripción: Este plugin agrega tres campos de texto a la pantalla de titulo, como informacion de la versión,
 * un enlace a tu sitio web, información de derechos de autor, o cualquier otra cosa.
 * ----------------------------------------------------------------------------
 * Documentación:
 * Este plugin no usa comandos de pluging.
 *
 * Historial de Versiones:
 * 1.0.0 - Versión inicial
 *
 * 1.1.0:
 * - Se agregó la opcion de agregar botones en la pantala de título para redes sociales, patron,
 *   discord, etc.
 *
 * 1.1.1:
 * - Error corregido con botones que desaparecen en algunos casos
 * - Se agregó un cambio de cursor a un puntero sobre los botones
 *
 * 1.1.2:
 * - Los sitios web ahora abren en el navegador predeterminado del usuario (Sólo local)
 *
 * 1.1.3:
 * - Corrección de errores para que el cursor de puntero permanezca si se selecciona con el teclado
 *
 * @param Text Options
 * @text Opciones de texto
 *
 * @param Font Size
 * @text Tamaño de la fuente
 * @parent Text Options
 * @type number
 * @min 1
 * @default 12
 * @desc Tamaño de la fuente
 *
 * @param Font Outline Width
 * @text Ancho del contorno de la fuente
 * @parent Text Options
 * @type number
 * @min 0
 * @default 2
 * @desc Un número más grande significa que el contorno será mas ancho. Establecer en 0 para no tener contorno
 *
 * @param Font Outline Color
 * @text Color del contorno de la fuente
 * @parent Text Options
 * @type text
 * @default black
 * @desc El color del contorno
 * 
 * @param Left Text
 * @text Texto izquierdo
 * @parent Text Options
 * @type text
 * @default 
 * @desc Texto para mostrar en la esquina inferior izquiera de la pantalla de título 
 * 
 * @param Center Text
 * @text Texto central
 * @parent Text Options
 * @type text
 * @default 
 * @desc Texto para mostrar en la parte inferior central de la pantalla de título
 * 
 * @param Right Text
 * @text Texto derecho
 * @parent Text Options
 * @type text
 * @default 
 * @desc Texto para mostrar en la parte inferior derecha de la pantalla de título
 *
 * @param Buttons
 * @text Botones
 * @type struct<Button>[]
 * @default []
 * @desc Configure los botones en los que se puede hacer clic aquí
*/
/*~struct~Button:es
 * @param Image
 * @text Archivo de Imagenes
 * @type file
 * @dir img/pictures
 * @default 
 * @desc El archivo de imagen (almacenado en la carpeta de imágenes) para usar
 *
 * @param x
 * @text Coordenada x
 * @type number
 * @min 0
 * @default 0
 * @desc La coordenada x para mostrar el botón
 *
 * @param y
 * @text Coordenada y
 * @type number
 * @min 0
 * @default 0
 * @desc La coordenada y para mostrar el botón
 *
 * @param width
 * @text Ancho del botón
 * @type number
 * @min 1
 * @default 50
 * @desc El ancho del botón
 *
 * @param height
 * @text Altura del botón
 * @type number
 * @min 1
 * @default 50
 * @desc La altura del botón
 *
 * @param URL
 * @text URL de sitio web
 * @type text
 * @default 
 * @desc Entrar en la URL de un sitio web que se inicirá al hacer clic
*/
var Imported = Imported || {};
Imported.CGMZ_GameInfo = true;
var CGMZ = CGMZ || {};
CGMZ.Versions = CGMZ.Versions || {};
CGMZ.Versions["Game Info"] = "1.1.3";
CGMZ.GameInfo = CGMZ.GameInfo || {};
CGMZ.GameInfo.parameters = PluginManager.parameters('CGMZ_GameInfo');
CGMZ.GameInfo.LeftText = CGMZ.GameInfo.parameters["Left Text"];
CGMZ.GameInfo.CenterText = CGMZ.GameInfo.parameters["Center Text"];
CGMZ.GameInfo.RightText = CGMZ.GameInfo.parameters["Right Text"];
CGMZ.GameInfo.FontOutlineColor = CGMZ.GameInfo.parameters["Font Outline Color"];
CGMZ.GameInfo.FontSize = Number(CGMZ.GameInfo.parameters["Font Size"]);
CGMZ.GameInfo.FontOutlineWidth = Number(CGMZ.GameInfo.parameters["Font Outline Width"]);
CGMZ.GameInfo.Buttons = JSON.parse(CGMZ.GameInfo.parameters["Buttons"]);
//=============================================================================
// Scene_Title
//-----------------------------------------------------------------------------
// Modify the title scene to add additional text at bottom.
// modified functions: createForeground
//=============================================================================
//-----------------------------------------------------------------------------
// Also add CGMZ info text to foreground
//-----------------------------------------------------------------------------
const alias_CGMZ_GameInfo_createForeground = Scene_Title.prototype.createForeground;
Scene_Title.prototype.createForeground = function() {
    alias_CGMZ_GameInfo_createForeground.call(this);
	this.CGMZ_GameInfo_DrawGameInfo();
	this.CGMZ_GameInfo_DrawSocialButtons();
};
//-----------------------------------------------------------------------------
// Draw CGMZ info text
//-----------------------------------------------------------------------------
Scene_Title.prototype.CGMZ_GameInfo_DrawGameInfo = function () {
	const x = 20;
    const y = Graphics.height - (28 + CGMZ.GameInfo.FontSize);
    const maxWidth = Graphics.width - x * 2;
	const bitmap = this._gameTitleSprite.bitmap;
	bitmap.outlineColor = CGMZ.GameInfo.FontOutlineColor;
	bitmap.outlineWidth = CGMZ.GameInfo.FontOutlineWidth;
    bitmap.fontSize = CGMZ.GameInfo.FontSize;
	bitmap.drawText(CGMZ.GameInfo.LeftText, x, y, maxWidth, 48, 'left');
    bitmap.drawText(CGMZ.GameInfo.CenterText, x, y, maxWidth, 48, 'center');
	bitmap.drawText(CGMZ.GameInfo.RightText, x, y, maxWidth, 48, 'right');
};
//-----------------------------------------------------------------------------
// Draw CGMZ social media / patreon / etc buttons
//-----------------------------------------------------------------------------
Scene_Title.prototype.CGMZ_GameInfo_DrawSocialButtons = function() {
	let buttonArray = CGMZ.GameInfo.Buttons;
	for(let i = 0; i < buttonArray.length; i++) {
		let buttonObject = JSON.parse(buttonArray[i]);
		let sprite = new Sprite_CGMZ_GameInfo_Button(buttonObject["URL"]);
		sprite.bitmap = ImageManager.loadPicture(buttonObject["Image"]);
		sprite.move(buttonObject.x, buttonObject.y);
		sprite.bitmap.addLoadListener(this.CGMZ_GameInfo_scaleSprite.bind(this, {"sprite": sprite, "width": buttonObject.width, "height": buttonObject.height}));
		sprite.opacity = 200;
		this.addChild(sprite);
	}
};
//-----------------------------------------------------------------------------
// Scale sprite after load
//-----------------------------------------------------------------------------
Scene_Title.prototype.CGMZ_GameInfo_scaleSprite = function(args) {
	let sprite = args.sprite;
	sprite.scale.x = args.width / sprite.width;
	sprite.scale.y = args.height / sprite.height;
};
//=============================================================================
// Sprite_CGMZ_GameInfo_Button
//-----------------------------------------------------------------------------
// Buttons for the title screen with mouse over behavior and click behavior
//=============================================================================
function Sprite_CGMZ_GameInfo_Button() {
    this.initialize(...arguments);
}
Sprite_CGMZ_GameInfo_Button.prototype = Object.create(Sprite_Clickable.prototype);
Sprite_CGMZ_GameInfo_Button.prototype.constructor = Sprite_CGMZ_GameInfo_Button;
//-----------------------------------------------------------------------------
// Initialize
//-----------------------------------------------------------------------------
Sprite_CGMZ_GameInfo_Button.prototype.initialize = function(url) {
	Sprite_Clickable.prototype.initialize.call(this);
	this._targetOpacity = 200;
	this._url = url;
	this._cursor = document.body.style.cursor;
};
//-----------------------------------------------------------------------------
// On destroy, turn cursor back to normal
//-----------------------------------------------------------------------------
Sprite_CGMZ_GameInfo_Button.prototype.destroy = function() {
	document.body.style.cursor = this._cursor;
	Sprite_Clickable.prototype.destroy.call(this);
};
//-----------------------------------------------------------------------------
// Update
//-----------------------------------------------------------------------------
Sprite_CGMZ_GameInfo_Button.prototype.update = function() {
	Sprite_Clickable.prototype.update.call(this);
	if(this.opacity !== this._targetOpacity) {
		this.updateOpacity();
	}
};
//-----------------------------------------------------------------------------
// Update the opacity of the sprite
//-----------------------------------------------------------------------------
Sprite_CGMZ_GameInfo_Button.prototype.updateOpacity = function() {
	if(this.opacity < this._targetOpacity) {
		this.opacity += 5;
		if(this.opacity > this._targetOpacity) {
			this.opacity = this._targetOpacity;
		}
	} else {
		this.opacity -= 5;
		if(this.opacity < this._targetOpacity) {
			this.opacity = this._targetOpacity;
		}
	}
};
//-----------------------------------------------------------------------------
// If mouse over, change opacity to 255
//-----------------------------------------------------------------------------
Sprite_CGMZ_GameInfo_Button.prototype.onMouseEnter = function() {
    this._targetOpacity = 255;
	this._cursor = document.body.style.cursor;
	document.body.style.cursor = "pointer";
};
//-----------------------------------------------------------------------------
// If not hovered, change opacity to 200
//-----------------------------------------------------------------------------
Sprite_CGMZ_GameInfo_Button.prototype.onMouseExit = function() {
    this._targetOpacity = 200;
	document.body.style.cursor = this._cursor;
};
//-----------------------------------------------------------------------------
// Open URL when clicked
//-----------------------------------------------------------------------------
Sprite_CGMZ_GameInfo_Button.prototype.onClick = function() {
	if(Utils.isNwjs()) {
		require('nw.gui').Shell.openExternal(this._url);
	} else {
		window.open(this._url);
	}
};