import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'APIgasolineras';

  estaciones: any[] = []; // Array para almacenar las estaciones de servicio
  provincias: any[] = [];
  municipios: any[] = [];
  productos: any[] = [];

  tipoCarburante: any;

  apiUrlProvincias = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/Provincias/';
  apiUrlMunicipios = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/MunicipiosPorProvincia/';

  apiUrlEstacionesMunicipio = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroMunicipio/';
  apiUrlEstacionesProvincia = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/';
  
  apiUrlProductos = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/ProductosPetroliferos/';
  apiUrlMunicipioProducto = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroMunicipioProducto/';
  apiUrlProvinciaProducto = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/';

  constructor() { }

  ngOnInit(): void {
    this.obtenerProvincias();
    this.obtenerProductos();
  }

  obtenerProvincias() {
    fetch(this.apiUrlProvincias) // Solicitud a la API de provincias
      .then(response => response.json())
      .then(data => {
        this.provincias = data.map((provinciaData: any) => ({ // Transforma los datos en un array de objetos con id y nombre de la provincia
          id: provinciaData.IDPovincia,
          nombre: provinciaData.Provincia
        }));
      })
      .catch(error => {
        console.error('Error al obtener provincias:', error);
      });
  }

  cargarMunicipios(idProvincia: string) {
    fetch(`${this.apiUrlMunicipios}/${idProvincia}`)
      .then(response => response.json())
      .then(data => {
        this.municipios = data.map((municipioData: any) => ({
          id: municipioData.IDMunicipio,
          nombre: municipioData.Municipio
        }));
      })
      .catch(error => {
        console.error('Error al obtener municipios:', error);
      });
  }

  obtenerProductos() {
    fetch(this.apiUrlProductos)
      .then(response => response.json())
      .then(data => {
        this.productos = data.map((productoData: any) => ({
          id: productoData.IDProducto,
          nombre: productoData.NombreProducto
        }));
      })
      .catch(error => {
        console.error('Error al obtener provincias:', error);
      });
  }

  /**
   * Método cuando seleccionemos una provincia
   * @param event 
   */
  onProvinciaChange(event: any) {
    const idProvincia = event.target.value;
    this.cargarMunicipios(idProvincia); // Carga los municipios de la provincia seleccionada
  }

  submitForm(event: Event) {
    event.preventDefault(); // Evitar la recarga de la página

    /**
     * Obtenemos los datos de los inputs
     */
    const provinciaSeleccionada = (document.getElementById('provincia') as HTMLSelectElement).value;
    const municipioSeleccionado = (document.getElementById('municipio') as HTMLSelectElement).value;
    this.tipoCarburante = (document.getElementById('tipoCarburante') as HTMLSelectElement).value;
    const checkbox = document.getElementById('eessMasEconomicas') as HTMLInputElement;

    let apiURL: string; // Variable para almacenar la URL de la API que se utilizará para obtener las estaciones de servicio

    if (municipioSeleccionado) {
      switch(this.tipoCarburante) { // Selecciona la URL de la API según el tipo de carburante seleccionado
        case "":
          apiURL = `${this.apiUrlEstacionesMunicipio}/${municipioSeleccionado}`
        break;
        default:
          apiURL = `${this.apiUrlMunicipioProducto}/${municipioSeleccionado}/${this.tipoCarburante}`
        break;
      }

      
      fetch(apiURL) // Realiza una solicitud HTTP a la API correspondiente
        .then(response => response.json())
        .then(data => {

          if (data.ListaEESSPrecio && data.ListaEESSPrecio.length > 0) {
            this.estaciones = data.ListaEESSPrecio;

            if (checkbox.checked) {
              // Utiliza la función de ordenamiento de JavaScript para ordenar las estaciones
              this.estaciones.sort((a, b) => {
              
              if (this.tipoCarburante == '') {
                if (!isNaN(parseFloat(a['Precio Gasoleo A'].replace(',', '.'))) && !isNaN(parseFloat(b['Precio Gasoleo A'].replace(',', '.')))) {
                    return parseFloat(a['Precio Gasoleo A'].replace(',', '.')) - parseFloat(b['Precio Gasoleo A'].replace(',', '.'));
                } else if (isNaN(parseFloat(a['Precio Gasoleo A'].replace(',', '.'))) && !isNaN(parseFloat(b['Precio Gasoleo A'].replace(',', '.')))) {
                    return 1; // precioA es NaN, lo colocamos después de precioB
                } else if (!isNaN(parseFloat(a['Precio Gasoleo A'].replace(',', '.'))) && isNaN(parseFloat(b['Precio Gasoleo A'].replace(',', '.')))) {
                    return -1; // precioB es NaN, lo colocamos antes de precioA
                } else {
                    return 0; // Ambos son NaN, no cambia el orden
                }
              } else {
                if (!isNaN(parseFloat(a['PrecioProducto'].replace(',', '.'))) && !isNaN(parseFloat(b['PrecioProducto'].replace(',', '.')))) {
                  return parseFloat(a['PrecioProducto'].replace(',', '.')) - parseFloat(b['PrecioProducto'].replace(',', '.'));
                } else if (isNaN(parseFloat(a['PrecioProducto'].replace(',', '.'))) && !isNaN(parseFloat(b['PrecioProducto'].replace(',', '.')))) {
                    return 1; // precioA es NaN, lo colocamos después de precioB
                } else if (!isNaN(parseFloat(a['PrecioProducto'].replace(',', '.'))) && isNaN(parseFloat(b['PrecioProducto'].replace(',', '.')))) {
                    return -1; // precioB es NaN, lo colocamos antes de precioA
                } else {
                    return 0; // Ambos son NaN, no cambia el orden
                }
              }

              });

            }

          } else {
            console.error('No se encontraron estaciones de servicio');
            this.estaciones = []; // Vacía el array `estaciones`
          }

        })
        .catch(error => {
          console.error('Error al obtener estaciones de servicio:', error);
        });

    } else {

      if (provinciaSeleccionada) {

        switch(this.tipoCarburante) {
          case "":
             apiURL = `${this.apiUrlEstacionesProvincia}/${provinciaSeleccionada}`
          break;
          default:
            apiURL = `${this.apiUrlProvinciaProducto}/${provinciaSeleccionada}/${this.tipoCarburante}`
          break;
        }

        // Realizar solicitud HTTP para obtener las estaciones de servicio de la provincia seleccionada
        fetch(apiURL)
        .then(response => response.json())
        .then(data => {

          // Asignar los datos de las estaciones de servicio al array estaciones
          if (data.ListaEESSPrecio && data.ListaEESSPrecio.length > 0) {
            this.estaciones = data.ListaEESSPrecio;

            if (checkbox.checked) {
              // Utiliza la función de ordenamiento de JavaScript para ordenar las estaciones
              this.estaciones.sort((a, b) => {
                // Debes adaptar estas líneas según cómo estén almacenados los precios en tu objeto 'estacion'
                if (this.tipoCarburante == '') {
                  // Debes adaptar estas líneas según cómo estén almacenados los precios en tu objeto 'estacion'
                  if (!isNaN(parseFloat(a['Precio Gasoleo A'].replace(',', '.'))) && !isNaN(parseFloat(b['Precio Gasoleo A'].replace(',', '.')))) {
                      return parseFloat(a['Precio Gasoleo A'].replace(',', '.')) - parseFloat(b['Precio Gasoleo A'].replace(',', '.'));
                  } else if (isNaN(parseFloat(a['Precio Gasoleo A'].replace(',', '.'))) && !isNaN(parseFloat(b['Precio Gasoleo A'].replace(',', '.')))) {
                      return 1; // precioA es NaN, lo colocamos después de precioB
                  } else if (!isNaN(parseFloat(a['Precio Gasoleo A'].replace(',', '.'))) && isNaN(parseFloat(b['Precio Gasoleo A'].replace(',', '.')))) {
                      return -1; // precioB es NaN, lo colocamos antes de precioA
                  } else {
                      return 0; // Ambos son NaN, no cambia el orden
                  }
                } else {
                  if (!isNaN(parseFloat(a['PrecioProducto'].replace(',', '.'))) && !isNaN(parseFloat(b['PrecioProducto'].replace(',', '.')))) {
                    return parseFloat(a['PrecioProducto'].replace(',', '.')) - parseFloat(b['PrecioProducto'].replace(',', '.'));
                  } else if (isNaN(parseFloat(a['PrecioProducto'].replace(',', '.'))) && !isNaN(parseFloat(b['PrecioProducto'].replace(',', '.')))) {
                      return 1; // precioA es NaN, lo colocamos después de precioB
                  } else if (!isNaN(parseFloat(a['PrecioProducto'].replace(',', '.'))) && isNaN(parseFloat(b['PrecioProducto'].replace(',', '.')))) {
                      return -1; // precioB es NaN, lo colocamos antes de precioA
                  } else {
                      return 0; // Ambos son NaN, no cambia el orden
                  }
                }
                
              });
            }

          } else {
            console.error('No se encontraron estaciones de servicio');
            this.estaciones = [];
          }

        })
        .catch(error => {
          console.error('Error al obtener estaciones de servicio:', error);
        });

      } else {
        this.estaciones = []; // Vacía el array `estaciones` si no se ha seleccionado ni municipio ni provincia.
      }

    }

  }

}
