1.- cd ubicacion/injectorExtractor

2.- Si se usara el inyector, agregar archivo .bpmn a la carpeta InjectorInput (Salida --> InjectorOutput)
    Si se usara el extractor, agregar archivo .xmi a la carpeta ExtractorInputs (Salida --> ExtractorInputs)

3.- Ejecución:
	INYECTOR: java -jar nombre_archivo.bpmn injectorExtractor.jar inyector
	EXTRACTOR: java -jar nombre_archivo.xmi injectorExtractor.jar extractor

4.- Comprobar la salida

5.- Borrar archivos de entrada, ya que solo puede trabajar con 1 archivo (NO BORRAR LA CARPETA)
    * En caso de haber usado inyector, borrar contenido de la carpeta InjectorInput
    * En caso de haber usado inyector, borrar contenido de la carpeta ExtractorInputs
------------------
PRUEBAS HECHAS EN: 
------------------
openjdk 17.0.8.1 2023-08-24
OpenJDK Runtime Environment (build 17.0.8.1+1-Ubuntu-0ubuntu122.04)
OpenJDK 64-Bit Server VM (build 17.0.8.1+1-Ubuntu-0ubuntu122.04, mixed mode, sharing)

------------------------------
*** SI EL NOMBRE TIENE ESPACIO TIENE QUE COLOCAR EL NOMBRE Y LA EXTENSIÓN DEL ARCHIVO ENTRE COMILLAS ***