import HouseInterior from '../components/HouseInterior';
import {objects} from './objects';
export default function StudioHouse({onExit}){return <HouseInterior title="Atelierul echipei" owner="Echipa" description="Descoperă cele cinci obiecte" objects={objects} onExit={onExit}/>;}
