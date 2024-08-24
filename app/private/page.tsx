import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
// import Home from '../chat/page';
import { FC } from 'react';
import { SummaryForm } from '@/components/Form';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center' as 'center',
    // justifyContent: 'flex-start' as 'flex-start',
    minHeight: '100vh',
    backgroundColor: 'black',
    fontFamily: 'Arial, sans-serif',
  },
  greeting: {
    backgroundColor: '#fff',
    color:'black',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
    textAlign: 'center' as 'center',
    width: '100%',
    maxWidth: '600px',
  },
  highlight: {
    // color:'black',
    color:'blue',
    fontWeight: 'bold' as 'bold',
  }
};

const PrivatePage: FC = async () => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
    return null; 
  }

  return (
    <>
    <div style={styles.container}>
      <div style={styles.greeting}>
        <p>
          Hello <span style={styles.highlight}>{data.user.email}</span>
        </p>
      </div>
       <SummaryForm userId={data.user.id} />
        {/* <SummaryForm/> */}
    </div>
 
     </>
  );
};

export default PrivatePage;
