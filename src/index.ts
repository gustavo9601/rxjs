import {Observable, Observer, Subject} from 'rxjs'

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


//Otra forma de ejecutar una subscripcion es pasarle un oberver objeto que tenga definido que hacer en las funciones next, error y complete
const observer1: Observer<any> = {
    next: valor_next => console.log("valor_next desde observer", valor_next),
    error: valor_error => console.log("valor_error desde observer", valor_error),
    complete: () => console.log("valor_complete desde observer")
}

observable1$.subscribe(observer1);   //Le pasamos el observer para que realice las operaciones respectivas


/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/

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

    //Haciendo una limpieza manual, cuando se llame a este observable su unsubcribe como un complete
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


/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/
/*=======================================================================*/



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
},5000)


//Subject => permite que cualquier suscripcion del observable emita la misma respuesta a todas las emisiones

// Distribuira el mismo valor a todas las subscripciones
// Es un observer
// Usa next, error y complete
const subject1$ = new Subject();
intervalo3$.subscribe(subject1$)   // De esta forma en suscripcion se llevara la emision de cualquier cosa del observable
// y la unificara en un mismo valor para todas las supciones

const subscripcionIntervaloRandom3 = subject1$.subscribe(numero_random => console.log("subscripcionIntervaloRandom3", numero_random))
const subscripcionIntervaloRandom4 = subject1$.subscribe(numero_random => console.log("subscripcionIntervaloRandom4", numero_random))


setTimeout(() => {

    //Permite emitir adicionalmente al flujo la emision de un nuevo valor
    subject1$.next(10000)
    subject1$.complete()  // tambien permite la ejecucion del complete, pero para finalizar la subscripcion se debe usar unsubscribe

    subscripcionIntervaloRandom3.unsubscribe()
    subscripcionIntervaloRandom4.unsubscribe()


},5000)
