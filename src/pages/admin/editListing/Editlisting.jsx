import { useParams } from 'react-router';
import Addlisting from '../addlisting/Addlisting';

const Editlisting = () => {
    const { id } = useParams();

    return <Addlisting isEdit={true} listingId={id} />;
};

export default Editlisting;
