import {Observable, Observer, Subject, of, fromEvent, range, asyncScheduler, interval, timer, from} from 'rxjs'
import {
    catchError,
    debounceTime,
    distinct, distinctUntilChanged,
    filter,
    first,
    map,
    mapTo,
    pluck,
    reduce,
    scan,
    skip,
    take,
    takeUntil,
    takeWhile,
    tap
} from "rxjs/operators";
import {ajax, AjaxError} from "rxjs/ajax";


function observablesNormales() {
    // new Observable<tipo de dato>( suscriber que emitira informacion )
    const observable1$ = new Observable<string>(subs => {
        //Emite el valor a todas las subcripciones
        subs.next('Hola Mundo')
        subs.next('Hola Mundo')
        subs.next('Hola Mundo')

        // .complete() Cuando se ejecute complete finaliza todas las emiciones
        subs.complete()
    });

    observable1$.subscribe(
        (respuestaSubscripcion) => {
            console.log("respuestaSubscripcion", respuestaSubscripcion)
        }
    )


    observable1$.subscribe(
        (observable1_valor_next) => {
            console.log("valor_next", observable1_valor_next)
        },
        (observable1_valor_error) => {
            console.log("observable1_valor_error", observable1_valor_error)
        },
        () => { // Sirve para definir que hacer cuando compelte la funcion
            console.log("observable1_complete")
        }
    )


//Otra forma de ejecutar una subscripcion es pasarle un
// oberver (Interfaz) objeto que tenga definido que hacer en las funciones next, error y complete
    const observer1: Observer<any> = {
        next: valor_next => console.log("valor_next desde observer", valor_next),
        error: valor_error => console.log("valor_error desde observer", valor_error),
        complete: () => console.log("valor_complete desde observer")
    }

    observable1$.subscribe(observer1);   //Le pasamos el observer para que realice las operaciones respectivas
}

//observablesNormales();

/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/

/*=======================================================================*/

function observablesConObserverAddUnsubscribe() {
    const observer2: Observer<any> = {
        next: valor_next => console.log("valor_next desde observer2", valor_next),
        error: valor_error => console.log("valor_error desde observer2", valor_error),
        complete: () => console.log("valor_complete desde observer2")
    }

    let counter = 1;
    const intervalo$ = new Observable<number>(subscriber => {
        const intervaloTiempo = setInterval(() => {
            subscriber.next(counter++);
        }, 1000)

        //Haciendo una limpieza manual, cuando se llame a este observable su *unsubcribe* como un complete
        return () => {
            clearInterval(intervaloTiempo);
            console.log("intervaloTiempo Detenido")
        }
    })

    const suscriptionIntervalo = intervalo$.subscribe(observer2)
    setTimeout(() => {
        // En tres segundos se desuscribira y ejecutara la funcion return () => {} del Observable intervalo$
        suscriptionIntervalo.unsubscribe()
    }, 3000)

// Suscribiendo de un observable en una misma linea, usando suscribers hijos

    const suscriptionIntervalo1 = intervalo$.subscribe(observer2)
    const suscriptionIntervalo2 = intervalo$.subscribe(observer2)
    const suscriptionIntervalo3 = intervalo$.subscribe(observer2)
//.add (suscripcion hija)
    suscriptionIntervalo1.add(suscriptionIntervalo2)
        .add(suscriptionIntervalo3)
    setTimeout(() => {
        // Desuscribira a la suscripcion y a sus hijos
        suscriptionIntervalo1.unsubscribe()
    }, 3000)

}

//observablesConObserverAddUnsubscribe();

/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/

/*=======================================================================*/

function observablesConObject() {
    const intervalo3$ = new Observable<number>(subs => {

        const intervalRandom = setInterval(() => {
            subs.next(Math.random())
        }, 1000)

        return () => {
            clearInterval(intervalRandom)
        }
    })

    const subscripcionIntervaloRandom1 = intervalo3$.subscribe(numero_random => console.log("subscripcionIntervaloRandom1", numero_random))
    const subscripcionIntervaloRandom2 = intervalo3$.subscribe(numero_random => console.log("subscripcionIntervaloRandom2", numero_random))

    setTimeout(() => {
        subscripcionIntervaloRandom1.unsubscribe()
        subscripcionIntervaloRandom2.unsubscribe()
    }, 5000)


//Subject => permite que cualquier suscripcion del observable emita la misma respuesta a todas las emisiones

// Distribuira el mismo valor a todas las subscripciones
// Es un observer
// Usa next, error y complete
    const subject1$ = new Subject();
    intervalo3$.subscribe(subject1$);   // De esta forma en suscripcion se llevara la emision de cualquier cosa del observable
// y la unificara en un mismo valor para todas las supciones

    const subscripcionIntervaloRandom3 = subject1$.subscribe(numero_random => console.log("subscripcionIntervaloRandom3", numero_random))
    const subscripcionIntervaloRandom4 = subject1$.subscribe(numero_random => console.log("subscripcionIntervaloRandom4", numero_random))


    setTimeout(() => {
        //Permite emitir adicionalmente al flujo la emision de un nuevo valor
        subject1$.next(10000)
        subject1$.complete()  // tambien permite la ejecucion del complete, pero para finalizar la subscripcion se debe usar unsubscribe

        subscripcionIntervaloRandom3.unsubscribe()
        subscripcionIntervaloRandom4.unsubscribe()
    }, 5000)


}

//observablesConObject();

/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/

//Funciones propias de Rxjs que simplifica la creacion de observables


// of()  Crea un observable en base a un listado de elementos separados por comas != a un [], si se requiere se puede mandar
// con el operador ...[1,2,3,4,5] para que genere elementos pro separado
// Recorre todos los valores secuencialemtne emitiendolos y al finalizar la lista, se ejecuta el complete

function observablesOf() {
    const observableof1$ = of(1, 2, 3, 4, 5);
    observableof1$.subscribe(
        (next) => {
            console.log("next observableof1$", next)
        },
        (error) => {
            console.log("error observableof1$", error)
        },
        () => {
            console.log("Termino la secuencia observableof1$")
        }
    )

    const observableof2$ = of<any>(1, [1, 2], {'a': "A", "b": "B"}, true);
    observableof2$.subscribe((valor_next) => {
        console.log("observableof2$ valor_next", valor_next)
    })

}

//observablesOf()

/////////////////////////////////////////////////////
// from(arreglo) crea un observable a partir de un array, promise, iterable, observable
// permite a partir de casi cualquier tipo de dato y convertirlo a observable

function observablesFrom() {
    //const observablefrom1$ = from(['hola', 1, 2, 3, {'indice': 'valor'}], asyncScheduler)
    const observablefrom1$ = from(['hola', 1, 2, 3, {'indice': 'valor'}])

    console.log("inicio")
    observablefrom1$.subscribe((respuesta) => {
        console.log("respuesta observablefrom1$", respuesta)
    })
    console.log("fin")

    // un generador
    const generador1 = function* () {
        yield 1;
        yield 2;
        yield 3;
        yield 4;
    }

    const observablefrom2$ = from(generador1())
    observablefrom2$.subscribe(
        (respuesta) => {
            console.log("respuesta observablefrom2$ generador", respuesta)
        }
    )

}


//observablesFrom();

/////////////////////////////////////////////////////
// fromEvent(document, 'scroll')  Crea un observable a partir de un evento en un target o elemento

function observablesfromEvent() {
    const observablefromevent1$ = fromEvent(document, 'click');  // Evento click
// Es bueno colocarle el tipo de evento, para poder acceder a las propiedades del evento
    const observablefromevent2$ = fromEvent<KeyboardEvent>(document, 'keyup');   // Evento cuando se suelta una tecla

    const observerFromEvent: Observer<any> = {
        next: (valorFromEvent) => console.log("valorFromEvent", valorFromEvent),
        error: () => {
        },
        complete: () => {
        },
    }
    observablefromevent1$.subscribe(observerFromEvent);
    observablefromevent2$.subscribe((respuestaKeyup) => {
        console.log("Evento keyup", respuestaKeyup.key)
    });
}

//observablesfromEvent();

/////////////////////////////////////////////////////
// range(1,5)  // emite una secuencia de numeros a partir de un rango
// range(valor_inicial, cantidad_de_valores)
// por defecto es sincrono

function observablesRange() {
    const observablerange1$ = range(0, 10)
    console.log("inicio observablerange1$")
    observablerange1$.subscribe(
        (respuesta) => {
            console.log("respuesta observablerange1$", respuesta)
        }
    )
    console.log("fin observablerange1$")


    /*
    * Si se le pasa asyncScheduler a cualquier funcion de rxjs se vuelve asincrona
    * */
    const observablerange2$ = range(0, 100, asyncScheduler);
    console.log("inicio observablerange2$")
    observablerange2$.subscribe(
        (respuesta) => {
            console.log("respuesta observablerange2$", respuesta)
        }
    )
    console.log("fin observablerange2$")

}

//observablesRange();


/////////////////////////////////////////////////////
// interval(milisegundos)
// genera el observable que emitira algo cada milisegundo pasado por parametro
// es asyncrono por naturaleza

function observableInterval() {
    // Empieza en 0 la imision por defecto
    const observableinterval1$ = interval(1000);


    observableinterval1$.subscribe(
        (respuesta) => {
            console.log("respuesta observableinterval1$", respuesta);
        }
    )

}

//observableInterval()

// timer(milisegundos)
// timer(milisegundos_delay, milisegundos_ejecutar)   => genera un interval con un deley y espcificando cada cuanto se va a ejecutar
// timer( fecha:Date )  => recibe una fecha, y en esa fecha si se da mientras esta abierto el navegador se emite
// emitira un observable despues de la cantidad en miilisegundos pasada por parametro

function observableTimer() {

    const observabletimer1$ = timer(3000);

    observabletimer1$.subscribe(
        (respuesta) => {
            console.log("respuesta observabletimer1$", respuesta)
        },
        () => {
        },
        () => {
            console.log("complete observabletimer1$ ")
        }
    )

    const hoy = new Date();  // variable con fecha actual
    hoy.setSeconds(hoy.getSeconds() + 10);  // le agregamos n cantidad de segundos a la fecha

    // El timer puede recibir una fecha, y en ese instante se ejecuta
    const observabletimer3$ = timer(hoy)

    observabletimer3$.subscribe(
        (respuesta) => {
            console.log("respuesta observabletimer3$ ", respuesta)
        }
    )

}

//observableTimer();


/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/

// Operadores sobre los observables


/////////////////////////////////
// map()
// permite tranformar la informacion y regresar una informacion modificada

function observableOperadorMap() {

    const observableRange1$ = range(1, 20);

    observableRange1$.subscribe((respuesta) => {
        //console.log("respuesta observableRange1$", respuesta)
    })


    //Usando el map para modificar el retorno de cada flujo de datos
    const observableRange2$ = range(1, 20).pipe(
        // <tipo dato recibe, tipo dato retornara>
        map<number, number>(
            (valor: number) => {
                // se debe hacer el retorno de algo, para que al suscribr se reciba el dato
                return valor * 2
            }
        )
    );
    observableRange2$.subscribe((respuesta) => {
        console.log("respuesta observableRange2$", respuesta)
    })

}


//observableOperadorMap()


/////////////////////////////////
// pluck()
// permite seleccionar a partir de un objeto la respuesta, acortando solo lo que se necesita
function observablesOperadorPluk() {
    const observablefromEvent$ = fromEvent<KeyboardEvent>(document, 'keyup').pipe(
        // se le pasa a pluck el nombre de la propiedad del objeto que queremos que retorne omitiendo el resto
        pluck('keyCode')
        //pluck('target', 'baseURI')   // si el objeto tiene mas produndidad se pasa entre comas
    )

    observablefromEvent$.subscribe((respuesta) => {
        console.log("respuesta observablefromEvent$", respuesta)
    })

}

//observablesOperadorPluk();


/////////////////////////////////
// mapTo()
// tranforma
function observablesOperadorMapTo() {
    const observablefromEvent$ = fromEvent<KeyboardEvent>(document, 'keyup').pipe(
        mapTo('Seteando por default el valor AL OPRIMIR CUALQUIER TECLA')
    )

    observablefromEvent$.subscribe((respuesta) => {
        console.log("respuesta observablefromEvent$", respuesta)
    })

}

//observablesOperadorMapTo();


/////////////////////////////////
// filter()
// permite filtrar las emisiones de lo que emita el observable
function observablesOperadorFilter() {

    const observablerange1$ = range(0, 100).pipe(
        // filter( valor_retorno_cada_iteracion => condicion_de_retorno )
        filter((valor) => valor % 2 == 0)
    )

    console.log("**Valores pares del range**")
    observablerange1$.subscribe(
        (respuesta) => {
            console.log("respuesta observablerange1$", respuesta)
        }
    )


    // obteniendo el indice de la iteracion
    const observablerange2$ = range(0, 100).pipe(
        // filter( (valor_retorno_cada_iteracion, indice) => {return condicion_de_retorno} )
        filter((valor, indice) => {
            return valor % 2 != 0
        })
    )

    console.log("**Valores IMPARES del range**")
    observablerange2$.subscribe(
        (respuesta) => {
            console.log("respuesta observablerange2$", respuesta)
        }
    )


    console.log(" *** Personajes heroes, y villanos")
    const personajes = [
        {tipo: 'heroe', 'nombre': 'batman'},
        {tipo: 'heroe', 'nombre': 'superman'},
        {tipo: 'villano', 'nombre': 'joker'},
        {tipo: 'villano', 'nombre': 'thanos'},
    ]

    const observablefrom1$ = from(personajes).pipe(
        filter((personaje) => {
            return personaje.tipo == 'heroe'
        })
    )

    observablefrom1$.subscribe(console.log)

}

//observablesOperadorFilter();


/////////////////////////////////
// tap()
// permite hacer operaciones adicionales en cada iteracion o algun valor pero no afecta el retorno

function observablesOperadorTap() {
    const observablerange1$ = range(1, 10).pipe(
        tap(
            (valor) => console.log("Valor dentro del pipe", valor)
        )
    )

    observablerange1$.subscribe();
}

//observablesOperadorTap();


/////////////////////////////////
// reduce( (valor_acumulado, valor_actual) )
// permite aplicar una funcion acumuladora a las emisiones del observable
// emite el valor cuando FINALIZA toda la iteracion del observable

function ejemploReduceSoloJs() {

    const valores_numericos = [1, 2, 3, 4, 566, 7, 99, 2];
    const functionReducerSumatoria = (acumulador: number, valorActual: number) => {
        return acumulador + valorActual;
    }

    // .reduce(funcion_callback_a_ejecutar, valor_inicial)
    const sumatoria_total = valores_numericos.reduce(functionReducerSumatoria, 0);
    console.log("sumatoria_total", sumatoria_total)
}

//ejemploReduceSoloJs();

function observableOperadorReduce() {
    const functionReducerSumatoria = (acumulador: number, valorActual: number) => {
        return acumulador + valorActual;
    }

    interval(1000).pipe(
        tap((valor_tap) => {
            console.log("valor en tap", valor_tap)
        }),
        take(5), // take(cantidad_emisiones)   => permite setear la cantidad de veces emititdas por supscripcion
        reduce(functionReducerSumatoria, 0)   // (funcion_calback, valor_inicial)
    ).subscribe(
        {
            next: (valor_next) => console.log("Valor next", valor_next),
            complete: () => {
                console.log("Termino la ejecucion")
            }
        }
    )

}

//observableOperadorReduce();


/////////////////////////////////
// scan( (valor_acumulado, valor_actual) )
// lo mismo que reduce, salvo que este operador en cada ieracion va retornando lo que lleva acumulado, y no hasta el final como reduce


function observableOperadorScan() {
    const functionReducerSumatoria = (acumulador: number, valorActual: number) => {
        return acumulador + valorActual;
    }

    interval(1000).pipe(
        take(5), // take(cantidad_emisiones)   => permite setear la cantidad de veces emititdas por supscripcion
        scan(functionReducerSumatoria, 0)   // (funcion_calback, valor_inicial)
    ).subscribe(
        {
            next: (valor_next) => console.log("Valor next", valor_next),
            complete: () => {
                console.log("Termino la ejecucion")
            }
        }
    )

}

//observableOperadorScan();


/////////////////////////////////
// take( cantidad_veces_a_permitir_emision )
// permite limitar la cantidad de misiones de un observable para una suscripcion, y llama al complete cuando finalice


function observableOperadorTake() {

    const observableof1 = of(1, 2, 3, 4, 5, 6, 7, 89).pipe(
        take(5)
    )

    observableof1.subscribe({
        next: (valor) => console.log("Valor del next", valor),
        complete: () => console.log("Completo la emision en take 5")
    })

}

//observableOperadorTake();


/////////////////////////////////
// first()
// Sin parametros, toma la primer emision del observable y lo finaliza con complete
// first( x = x > 10 )
// Recibe por parametro una funcion que retorne una condicion, y una ves se cumpla se finaliza retornado la primer concidencia

function observablesOperadorFirst() {
    const click$ = fromEvent<MouseEvent>(document, 'click');

    click$.pipe(
        tap<MouseEvent>(console.log),
        // map( event => ({
        //     clientY: event.clientY,
        //     clientX: event.clientX
        // }) )
        map(({clientX, clientY}) => ({clientY, clientX})),

        first(event => event.clientY >= 150)
    )
        .subscribe({
            next: val => console.log('next:', val),
            complete: () => console.log('complete')
        });

}

//observablesOperadorFirst();


/////////////////////////////////
// takeWhile( x => x > 4)
// recibe una funcion que retorne una condicion o boolean
// permite emitir valores, mientras la condicion por paraemtro se ciumpla
// cuando no cumpla se detiene y ejecuta el complete

function observableOperadorTakeWhile() {
    const click$ = fromEvent<MouseEvent>(document, 'click');

    click$.pipe(
        // al map le pasamos la desctructuracion del objeto, para que solo use esas variables que vienen del obejot
        map(({x, y}) => ({x, y})),
        // takeWhile( ({ y })=> y <= 150 )

        // si se envia el segundo parametro como true, va a retornar el ulitmo valor que rompe la condicion
        takeWhile(({y}) => y <= 150, true)
    )
        .subscribe({
            next: val => console.log('next:', val),
            complete: () => console.log('complete'),
        });
}

//observableOperadorTakeWhile();


/////////////////////////////////
// takeUntil(observable)
// Emite valores hasta que la primer emision del observable pasado por parametro

// skip(cantidad_de omisiones)
// permite defiir un valor inicial de smisiones que se cumplan, y se motrara solo cuando llegue a ese numero
// despues de haber llamado omitira las demas emisiones hasta el complete

function observableOperadorTakeUntilSkip() {
    const boton = document.createElement('button');
    boton.innerHTML = 'Detener Timer';

    document.querySelector('body').append(boton);

    const counter$ = interval(1000);
// const clickBtn$ = fromEvent( boton, 'click' );
    const clickBtn$ = fromEvent(boton, 'click').pipe(
        tap(() => console.log('tap antes de skip')),
        skip(1),
        tap(() => console.log('tap después de skip')),
    )

    counter$.pipe(
        takeUntil(clickBtn$)
    ).subscribe({
        next: val => console.log('next', val),
        complete: () => console.log('complete')
    });
}

//observableOperadorTakeUntilSkip();


/////////////////////////////////
// distinct()
// Permite verificar cada emision, y solo emitira el primer valor enviado, si se envia uno con el mismo valor lo omite
// hace un distinc de las emisiones tomando unicamente el primer valor como valido los demas los omite

function observablesOperadoresDisctinct() {
    const numeros$ = of<number | string>(1, '1', 1, 3, 3, 2, 2, 4, 4, 5, 3, 1, '1');

    numeros$.pipe(
        distinct() // ===
    ).subscribe(console.log);

    interface Personaje {
        nombre: string;
    }

    const personajes: Personaje[] = [
        {
            nombre: 'Megaman'
        },
        {
            nombre: 'X'
        },
        {
            nombre: 'Zero'
        },
        {
            nombre: 'Dr. Willy'
        },
        {
            nombre: 'X'
        },
        {
            nombre: 'Megaman'
        },
        {
            nombre: 'Zero'
        },
    ];

    from(personajes).pipe(
        distinct(p => p.nombre)
    ).subscribe(console.log);

}

//observablesOperadoresDisctinct();

/////////////////////////////////
// distinctUntilChanged()
// cumple la funcion similar al distinct, pero para este caso solo omitira las emisiones que sean exacamente al anterior,
// en caso contrario las emitira
// // distinctUntilChanged((ant, act) => ant.nombre === act.nombre)
// (ant, act) => ant.nombre === act.nombre    => permite darle la logica de validacion para retornar si es igual o no al anterior, para objetos
// o variables que no son de tipo primario (int, string, boolean)

function observableOperadoresdistinctUntilChanged() {
    const numeros$ = of<number | string>(1, '1', 1, 3, 3, 2, 2, 4, 4, 5, 3, 1, '1');

    numeros$.pipe(
        distinctUntilChanged()
    ).subscribe(console.log);

    interface Personaje {
        nombre: string;
    }

    const personajes: Personaje[] = [
        {
            nombre: 'Megaman'
        },
        {
            nombre: 'Megaman'
        },
        {
            nombre: 'Zero'
        },
        {
            nombre: 'Dr. Willy'
        },
        {
            nombre: 'X'
        },
        {
            nombre: 'X'
        },
        {
            nombre: 'Zero'
        },
    ];

    from(personajes).pipe(
        distinctUntilChanged((ant, act) => ant.nombre === act.nombre)
    ).subscribe(console.log);
}


//observableOperadoresdistinctUntilChanged();


//////////////////////////////////
// debounceTime(numero_milisegundos_deley)
// permite darle un deley a la emision, sin embarso si dentro del dieley ocurren mas aemisiones siempre va a retornar solo la ultima
// y descarta las anteriores emisiones

function observableOperadordebounceTime() {
    const click$ = fromEvent(document, 'click');

    click$.pipe(
        debounceTime(2000)
    ).subscribe(console.log);

// Ejemplo 2
    const input = document.createElement('input');
    document.querySelector('body').append(input);

    const input$ = fromEvent(input, 'keyup');

    input$.pipe(
        debounceTime(1000),  // le damos el deley para que no se ejecute con cada tecla que se presione en el input
        pluck('target', 'value'),   // seleccionamos unicamente el valor target.value
        distinctUntilChanged()  // si el valor emitido es examente al anterior emitido, lo omitira
    ).subscribe(console.log);

}

//observableOperadordebounceTime();


/////////////////////////////////
// Encadenando varios operadores dentro de un pipe
function observablesVariosOperadores() {
    const observablefromEvent$ = fromEvent<KeyboardEvent>(document, 'keyup').pipe(
        map(valorEvento => valorEvento.code), // Seleccionamos el atributo que queremos mapear
        filter(code => code == 'Enter'),  // filtramos el evento para solo usar Enter
        mapTo('Se dio click en Enter')   // Seteamos por default el valor a retornar
    )

    observablefromEvent$.subscribe((respuesta) => {
        console.log("respuesta observablefromEvent$", respuesta)
    })

}

//observablesVariosOperadores()


/////////////////////////////////
// Ejercicio de operadores

function crearElementosContenidoHtml() {

    const elementoUl = document.createElement('ul')

    let html = '';
    for (let i = 0; i < 200; i++) {
        html += '<li>' + i + '</li>'
    }
    elementoUl.innerHTML = html;
    const bodyDocument = document.querySelector("body");
    bodyDocument.append(elementoUl);

    //Progess bar
    const progressBar = document.createElement('div');
    progressBar.setAttribute('class', 'progress-bar');
    bodyDocument.append(progressBar)

}

//crearElementosContenidoHtml();

// Funcion que recibe el calculo y modifica el css del elemento
function modificarWidthProgressBar(width = 0) {
    const progressBar = document.querySelector('.progress-bar') as HTMLElement;
    progressBar.style.width = width + '%';
}

function calculoValorScroll(evento) {

    //Destructuracion de objetos
    // Generamos las variables por independiente a partir del objeto recibido por parametro
    const {
        scrollTop,       // cantidad de pixles que se esta por encima de el top
        scrollHeight,    // Altura disponibile de toda la web
        clientHeight    // Altura del viewport del usuario
    } = evento.target.documentElement;

    //console.log(scrollTop, scrollHeight, clientHeight)

    return (scrollTop / (scrollHeight - clientHeight)) * 100;

}

//Funcion que detecta el cambio, y lo genera como observable
function observableFromEventScroll() {
    const observableformevent1 = fromEvent(document, 'scroll').pipe(
        map((valorEnventoSroll) => {
            return calculoValorScroll(valorEnventoSroll);
        })
    )

    observableformevent1.subscribe(
        (porcentaje_scroll_usuario) => {
            modificarWidthProgressBar(porcentaje_scroll_usuario)
            console.log("porcentaje_scroll_usuario", porcentaje_scroll_usuario)
        }
    );
}

//observableFromEventScroll();


/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/

/*///////////////////////////////////////////////////////////////////////*/
// fetch en js

const url = 'https://api.github.com/users?per_page=5'

const fetchPromesa = fetch(url)
// No se puede interceptar de forma clara
fetchPromesa
    .then(
        respuesta => respuesta.json().then(console.log)
    )
    .catch(error => console.log("error: ", error))


/*///////////////////////////////////////////////////////////////////////*/
// ajax rxjs permite realizar peticiones http de una forma mas eficiente, devuelve mas informacion de la peticion
// catchError()  // sirve para atrapara cualquier error que suja en el observable

// ajax.get(url, {headers})
ajax(url).pipe(
    //map(respuesta => respuesta.response)
    pluck('response'),
    catchError((error: AjaxError) => {
        console.log("Error en el catchError", error)
        //return error
        //Podemos retornar un nuevo observable
        return of([]);
    })
)
    .subscribe(
        (respuesta) => {
            console.log("respuesta ajax rxjs", respuesta)
        }
    )


// getJson(url, {headers})  realiza peticiones ajax y retorna un observable

const url2 = 'https://httpbin.org/delay/1';

const observableGetJson$ = ajax.getJSON(url2, {
    'Content-Type': 'cabcera test',
    'token_test': '123'
});

observableGetJson$.subscribe(data => console.log('data getjson: ', data))


//post con rxjs
// .post .put
// .delete(url, {cabeceras})
ajax.post(url2, {'valor1': 'valor'}, {'cabecera1': 'cabezera'}).subscribe(respuesta => console.log("respuesta post rxjs", respuesta))

//Otra forma de armar la peticion

ajax({
    url: 'url',
    method: 'POST', // GET | POST | PUT | DELETE
    headers: {
        'tokennn': 'token:valor'
    },
    body: {
        'campo1': 'valor1'
    }
}).subscribe(console.log)
