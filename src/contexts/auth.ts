import {createContext} from 'react';
import {Credentials} from "../types";

export const AuthContext = createContext<Credentials>({loaded: false, authorized: false});
