import {Observable, Observer} from 'rxjs'

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
const observer1 : Observer<any> = {
    next : valor_next => console.log("valor_next desde observer", valor_next),
    error : valor_error => console.log("valor_error desde observer", valor_error),
    complete : () => console.log("valor_complete desde observer")
}

observable1$.subscribe(observer1);   //Le pasamos el observer para que realice las operaciones respectivas




