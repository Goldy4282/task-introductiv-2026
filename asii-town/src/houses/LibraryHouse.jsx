import HouseInterior from '../components/HouseInterior';
import {objects} from './objects';
export default function LibraryHouse({onExit}){return <HouseInterior title="Biblioteca" owner="Echipa" description="Descoperă cele cinci obiecte" objects={objects} onExit={onExit}/>;}
