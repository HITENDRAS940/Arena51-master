import FootballIcon from './FootballIcon';
import CricketIcon from './CricketIcon';
import BowlingIcon from './BowlingIcon';
import PadelBallIcon from './PadelBallIcon';
import BadmintonIcon from './BadmintonIcon';
import TennisIcon from './TennisIcon';
import SwimmingIcon from './SwimmingIcon';
import BasketballIcon from './BasketballIcon';
import ArcadeIcon from './ArcadeIcon';
import GymIcon from './GymIcon';
import SpaIcon from './SpaIcon';
import StudioIcon from './StudioIcon';
import ConferenceIcon from './ConferenceIcon';
import PartyHallIcon from './PartyHallIcon';
import VenuesBackgroundIcon from './VenuesBackgroundIcon';
import DiscoveryArrowIcon from './DiscoveryArrowIcon';

export {
    FootballIcon,
    CricketIcon,
    BowlingIcon,
    PadelBallIcon,
    BadmintonIcon,
    TennisIcon,
    SwimmingIcon,
    BasketballIcon,
    ArcadeIcon,
    GymIcon,
    SpaIcon,
    StudioIcon,
    ConferenceIcon,
    PartyHallIcon,
    VenuesBackgroundIcon,
    DiscoveryArrowIcon
};

export interface ActivityIconProps {
    size?: number;
    color?: string;
    stroke?: string;
    strokeWidth?: number;
}

export const ActivityIcons: Record<string, React.FC<ActivityIconProps>> = {
    'Football': FootballIcon,
    'Cricket': CricketIcon,
    'Bowling': BowlingIcon,
    'Padel Ball': PadelBallIcon,
    'Badminton': BadmintonIcon,
    'Tennis': TennisIcon,
    'Swimming': SwimmingIcon,
    'Basketball': BasketballIcon,
    'Arcade': ArcadeIcon,
    'Gym': GymIcon,
    'Spa': SpaIcon,
    'Studio': StudioIcon,
    'Conference': ConferenceIcon,
    'Party Hall': PartyHallIcon,
};
