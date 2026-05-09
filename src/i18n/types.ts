import messages from "./messages/en";

type Join<K extends string, P extends string> = `${K}.${P}`;

type NestedKeys<T> = {
  [K in keyof T & string]: T[K] extends object ? Join<K, NestedKeys<T[K]>> : K;
}[keyof T & string];

export type MessageKey = NestedKeys<typeof messages>;

export type Messages = typeof messages;

type Flatten<T> = {
  [K in keyof T & string]: T[K] extends object ? Join<K, Flatten<T[K]>> : K;
}[keyof T & string];

export type Namespaces = keyof Messages & string;

export type GlobalKeys = Flatten<Messages>;

export type NamespaceKeys<N extends Namespaces> = Flatten<Messages[N]>;
