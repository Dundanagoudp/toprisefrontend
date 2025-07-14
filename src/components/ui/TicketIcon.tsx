import Image from 'next/image';
import Ticket from '../../../public/assets/Ticket.svg';
import Box from '../../../public/assets/Box.svg'
import Editicon from '../../../public/assets/EditIcon.svg'

const TicketIcon = () => (
  <Image src={Ticket} alt='ticket' width={24} height={24} />
);
export const BoxIcon = () => (
  <Image src={Box} alt='box' width={24} height={24} />
);
export const EditIcon = () => (
  <Image src={Editicon} alt='box' width={24} height={24} />
);

export default TicketIcon;
