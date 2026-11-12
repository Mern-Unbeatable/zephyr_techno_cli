import { useParams } from 'react-router';
import Addlisting from '../addlisting/Addlisting';

const DuplicateListing = () => {
    const { id } = useParams();

    return <Addlisting key={id} duplicateFromId={id} />;
};

export default DuplicateListing;
