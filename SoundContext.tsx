import { createContext, useContext } from 'react';

export const SoundContext = createContext({
    playSuccess: ()=> {}
});

export const useSound =()=> useContext(SoundContext)