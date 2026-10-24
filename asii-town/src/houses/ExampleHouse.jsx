import PersonalRoom from '../components/PersonalRoom';
import {MEMBERS} from './content';
// A new member can replace this component while retaining the shared game props.
export default function ExampleHouse(props){return <PersonalRoom {...props} member={props.member||MEMBERS[0]}/>;}
