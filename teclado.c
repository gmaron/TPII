#include <linux/input.h>

#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>

char *events[EV_MAX + 1] = { "Reset", "Key", "Relative", "Absolute", NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
NULL, NULL, NULL, "LED", "Sound", "Repeat" };
char *keys[KEY_MAX + 1] = { "Reserved", "Esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Minus", "Equal", "Backspace",
"Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "LeftBrace", "RightBrace", "Enter", "LeftControl", "A", "S", "D", "F", "G",
"H", "J", "K", "L", "Semicolon", "Apostrophe", "Grave", "LeftShift", "BackSlash", "Z", "X", "C", "V", "B", "N", "M", "Comma", "Dot",
"Slash", "RightShift", "KPAsterisk", "LeftAlt", "Space", "CapsLock", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10",
"NumLock", "ScrollLock", "7", "8", "9", "KPMinus", "4", "5", "6", "KPPlus", "1", "2", "3", "0", "KPDot", "103rd",
"F13", "102nd", "F11", "F12", "F14", "F15", "F16", "F17", "F18", "F19", "F20", "Enter", "RightCtrl", "KPSlash", "SysRq",
"RightAlt", "LineFeed", "Home", "Up", "PageUp", "Left", "Right", "End", "Down", "PageDown", "Insert", "Delete", "Macro", "Mute",
"VolumeDown", "VolumeUp", "Power", "KPEqual", "KPPlusMinus", "Pause", "F21", "F22", "F23", "F24", "JPN", "LeftMeta", "RightMeta",
"Compose", "Stop", "Again", "Props", "Undo", "Front", "Copy", "Open", "Paste", "Find", "Cut", "Help", "Menu", "Calc", "Setup",
"Sleep", "WakeUp", "File", "SendFile", "DeleteFile", "X-fer", "Prog1", "Prog2", "WWW", "MSDOS", "Coffee", "Direction",
"CycleWindows", "Mail", "Bookmarks", "Computer", "Back", "Forward", "CloseCD", "EjectCD", "EjectCloseCD", "NextSong", "PlayPause",
"PreviousSong", "StopCD", "Record", "Rewind", "Phone", "ISOKey", "Config", "HomePage", "Refresh", "Exit", "Move", "Edit", "ScrollUp",
"ScrollDown", "KPLeftParenthesis", "KPRightParenthesis",
NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
"Btn0", "Btn1", "Btn2", "Btn3", "Btn4", "Btn5", "Btn6", "Btn7", "Btn8", "Btn9",
NULL, NULL,  NULL, NULL, NULL, NULL,
"LeftBtn", "RightBtn", "MiddleBtn", "SideBtn", "ExtraBtn", "ForwardBtn", "BackBtn",
NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
"Trigger", "ThumbBtn", "ThumbBtn2", "TopBtn", "TopBtn2", "PinkieBtn",
"BaseBtn", "BaseBtn2", "BaseBtn3", "BaseBtn4", "BaseBtn5", "BaseBtn6",
NULL, NULL, NULL, NULL,
"BtnA", "BtnB", "BtnC", "BtnX", "BtnY", "BtnZ", "BtnTL", "BtnTR", "BtnTL2", "BtnTR2", "BtnSelect", "BtnStart", "BtnMode",
NULL, NULL, NULL,
"ToolPen", "ToolRubber", "ToolBrush", "ToolPencil", "ToolAirbrush", "ToolFinger", "ToolMouse", "ToolLens", NULL, NULL,
"Touch", "Stylus", "Stylus2" };

char *relatives[REL_MAX + 1] = { "X", "Y", "Z", NULL, NULL, NULL, "HWheel", "Dial", "Wheel" };
char *absolutes[ABS_MAX + 1] = { "X", "Y", "Z", "Rx", "Ry", "Rz", "Throttle", "Rudder", NULL, NULL, NULL, NULL, NULL, NULL, NULL,
NULL, "Hat0X", "Hat0Y", "Hat1X", "Hat1Y", "Hat2X", "Hat2Y", "Hat3X", "Hat 3Y", "Pressure", "Distance", "XTilt", "YTilt"};
char *leds[LED_MAX + 1] = { "NumLock", "CapsLock", "ScrollLock", "Compose", "Kana" };
char *repeats[REP_MAX + 1] = { "Delay", "Period" };
char *sounds[SND_MAX + 1] = { "Bell", "Click" };

char **names[EV_MAX + 1] = { events, keys, relatives, absolutes, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
NULL, NULL, leds, sounds, repeats };

int main (int argc, char **argv)
{
	int fd, rd, i;
	struct input_event ev[64];
	FILE *archivo;

	if (argc < 2) {
		printf ("Usage: evtest /dev/inputX\n");
		printf ("Where X = input device number\n");
		return 1; //exit (1);
	}
   char cwd[1024];
   if (getcwd(cwd, sizeof(cwd)) == NULL)
       perror("getcwd() error");
    
    char * teclas = malloc(12*sizeof(char));
    teclas = "/teclas.txt";
    size_t len1_cwd = strlen(cwd);
    size_t len2_teclas = strlen(teclas);
    char *result = malloc(len1_cwd+len2_teclas+1);//+1 for the zero-terminator
    //in real code you would check for errors in malloc here
    memcpy(result, cwd, len1_cwd);
    memcpy(result+len1_cwd, teclas, len2_teclas+1);//+1 to copy the null-terminator
    
	

#if 0
	for (i = 0; i < KEY_MAX; i++)
		printf("%d - %s\n", i, keys[i]);
#endif

	if ((fd = open(argv[argc - 1], O_RDONLY)) < 0) {
		perror("evtest");
		return 1;//exit(1);
	}


    /*
        habilitar la lectura de las teclas desde el javascript a traves de un archivo
        una vez que el usuario termino de realizar el tecleo, limpiar el archivo
        hacer un patron de busqueda para que el javascript lo descifre
    */
    archivo = fopen (result,"w");
    if (archivo == NULL){
        printf("Error al abrir el archivo");
        return 1;
    }
    int modPosArchivo = 1;
	while (1) {

        if (modPosArchivo == 1){
            fseek(archivo, 0, SEEK_SET);
            modPosArchivo = 0;
        }    
        
            rd = read(fd, ev, sizeof(struct input_event) * 64);

            if (rd < sizeof(struct input_event)) {
                perror("\nevtest: error reading");
                return 1 ; //exit (1);
            }

        
            char * tecla;
            tecla = malloc (6*sizeof(char));
            for (i = 0; i < ((rd / sizeof(struct input_event))); i++){
                if ((ev[i].value == 1)&&(ev[i].code != 0)){
                    tecla = names[ev[i].type] ? (names[ev[i].type][ev[i].code] ? names[ev[i].type][ev[i].code] : "?") : "?";
			         int ia = (int)tecla[0];

                    //valores entre 0 y 9 en la tabla ASCII -> decimal
                    if ((ia >= 48)&&(ia <= 57)){
                        fprintf(archivo,tecla);
                        fflush(archivo);
                        printf("Numero %c : ---%d---\n",tecla[0], ia);
                    }else{
                        //es la letra 'E' para el "enter"
                        printf("Tecla: %s -- Numero: %d\n",tecla,ia);
                        if (ia == 69){
                            printf("Enter: %s",tecla);
                            fprintf(archivo,tecla);
                            fflush(archivo);
                            modPosArchivo = 1;
                        }
                    }
                }
                }
        
    }
	fclose(archivo);
}